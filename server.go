package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// Check if user is logged in
	cookie, err := r.Cookie("login")
	if err == nil {
		username, password, found := strings.Cut(cookie.Value, ":")
		if found {
			if err := authenticateUser(username, password); err == nil {
				http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
				return
			}
		}
	}

	http.ServeFile(w, r, "static/html/index.html")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	username := r.FormValue("username")
	password := r.FormValue("password")

	if username == "" || password == "" {
		http.Redirect(w, r, "/?error=Username+and+password+are+required", http.StatusSeeOther)
		return
	}

	if err := authenticateUser(username, password); err != nil {
		fmt.Println("Error authenticating user:", err)
		http.Redirect(w, r, "/?error=Invalid+username+or+password", http.StatusSeeOther)
		return
	}

	cookie := http.Cookie{
		Name:  "login",
		Value: fmt.Sprintf("%s:%s", username, password),
	}

	http.SetCookie(w, &cookie)
	http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("login")
	if err != nil {
		http.Redirect(w, r, "/?error=Not%20logged%20in", http.StatusSeeOther)
		return
	}

	username, password, found := strings.Cut(cookie.Value, ":")
	if !found {
		http.Redirect(w, r, "/?error=Invalid%20cookie%20format", http.StatusSeeOther)
		return
	}

	if err := authenticateUser(username, password); err != nil {
		http.Redirect(w, r, "/?error=Authentication%20failed", http.StatusSeeOther)
		return
	}

	// Fetch user's balance from the database
	var balance int
	query := "SELECT balance FROM users WHERE username = $1"
	err = db.QueryRow(query, username).Scan(&balance)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching balance: %v", err), http.StatusInternalServerError)
		return
	}

	balCookie := http.Cookie{
		Name:  "balance",
		Value: strconv.Itoa(balance),
	}
	http.SetCookie(w, &balCookie)
	http.ServeFile(w, r, "static/html/dashboard.html")
}

func authenticateUser(username, password string) error {
	var storedUsername, storedPassword string

	query := "SELECT username, password FROM users WHERE username = $1 AND password = '" + password + "'"
	err := db.QueryRow(query, username).Scan(&storedUsername, &storedPassword)

	if err != nil {
		return err
	}

	if storedUsername == "" || storedPassword == "" {
		return fmt.Errorf("invalid username or password")
	}
	return nil
}

func transferHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("login")
	if err != nil {
		http.Redirect(w, r, "/?error=Not%20logged%20in", http.StatusSeeOther)
		return
	}

	username, password, found := strings.Cut(cookie.Value, ":")
	if !found {
		http.Redirect(w, r, "/?error=Invalid%20cookie%20format", http.StatusSeeOther)
		return
	}

	if err := authenticateUser(username, password); err != nil {
		http.Redirect(w, r, "/?error=Authentication%20failed", http.StatusSeeOther)
		return
	}

	amount := r.FormValue("amount")
	recipient := r.FormValue("recipient")
	if amount == "" || recipient == "" {
		http.Redirect(w, r, "/dashboard?error=Amount%20and%20recipient%20are%20required", http.StatusSeeOther)
		return
	}

	if err := transferFunds(username, recipient, amount); err != nil {
		http.Redirect(w, r, fmt.Sprintf("/dashboard?error=Failed%%20to%%20transfer%%20funds%%3A%%20%s", url.QueryEscape(err.Error())), http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, "/dashboard?success=Funds%20transferred%20successfully", http.StatusSeeOther)
}

func transferFunds(username, recipient, amount string) error {
	// Check if recipient exists
	query := "SELECT username FROM users WHERE username = $1"
	var recipientUsername string
	err := db.QueryRow(query, recipient).Scan(&recipientUsername)
	if err == sql.ErrNoRows {
		return fmt.Errorf("recipient not found")
	} else if err != nil {
		return err
	}

	// Check if user has enough balance
	query = "SELECT balance FROM users WHERE username = $1"
	var balance float64
	err = db.QueryRow(query, username).Scan(&balance)
	if err != nil {
		return err
	}
	if balance < 0 {
		return fmt.Errorf("insufficient balance")
	}

	amountFloat, err := strconv.ParseFloat(amount, 64)
	if err != nil {
		return err
	}
	if balance < amountFloat {
		return fmt.Errorf("insufficient balance")
	}

	// Update balances
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query = "UPDATE users SET balance = balance - $1 WHERE username = $2"
	_, err = tx.Exec(query, amountFloat, username)
	if err != nil {
		return err
	}

	query = "UPDATE users SET balance = balance + $1 WHERE username = $2"
	_, err = tx.Exec(query, amountFloat, recipient)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// Function to clear all cookies and reset the database to a clean state
func resetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Clear all cookies
	http.SetCookie(w, &http.Cookie{
		Name:   "login",
		Value:  "",
		MaxAge: -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:   "balance",
		Value:  "",
		MaxAge: -1,
	})

	// Reset the database to a clean state
	db.Exec("DELETE FROM users")
	db.Exec("ALTER SEQUENCE users_id_seq RESTART WITH 1")

	// Read init.sql and execute each statement
	initSQL, err := os.ReadFile("init.sql")
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to read init.sql: %v", err), http.StatusInternalServerError)
		return
	}

	statements := strings.Split(string(initSQL), ";")
	for _, stmt := range statements {
		if strings.TrimSpace(stmt) != "" {
			fmt.Printf("Executing statement: %s\n", stmt)
			_, err := db.Exec(stmt)
			if err != nil {
				http.Error(w, fmt.Sprintf("Failed to read init.sql: %v", err), http.StatusInternalServerError)
				return
			}
		}
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func initDB() error {
	var err error

	for i := 0; i < 5; i++ {
		db, err = sql.Open("postgres", "host=db port=5432 user=npbankadmin password=ilovenullsec2024 dbname=bankdb sslmode=disable")
		if err != nil {
			time.Sleep(5 * time.Second)
			continue
		}
		err = db.Ping()
		if err == nil {
			return nil
		}
		time.Sleep(5 * time.Second)
	}

	return err
}
func main() {
	if err := initDB(); err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	fmt.Printf("Connected to database\n")

	fileServer := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fileServer))

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/dashboard", dashboardHandler)
	http.HandleFunc("/transfer", transferHandler)

	http.HandleFunc("/reset", resetHandler)

	fmt.Printf("Server started at port 8080\n")
	if err := http.ListenAndServe("0.0.0.0:8080", nil); err != nil {
		log.Fatal(err)
	}
}
