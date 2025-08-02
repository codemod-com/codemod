package main

import (
	"fmt"
	"errors"
)

func main() {
	// These fmt calls will be matched and replaced
	fmt.Println("Hello, World!")
	fmt.Printf("User %s logged in
", "john")
	
	name := "Alice"
	age := 30
	fmt.Println("User info:", name, age)
	
	if err := doSomething(); err != nil {
		fmt.Printf("Error occurred: %v
", err)
	}
	
	// This should not be matched (string literal)
	message := "fmt.Println should not match this"
	
	// This should be matched
	fmt.Println("Processing complete")
}

func doSomething() error {
	fmt.Printf("Starting operation at %s
", "now")
	return errors.New("something went wrong")
}
