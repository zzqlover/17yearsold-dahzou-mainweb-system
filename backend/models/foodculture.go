package models

import "time"

type FoodItem struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Tags        string    `json:"tags"`
	Image       string    `json:"image"`
	SortOrder   int       `json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type FoodCultureData struct {
	HeroTitle    string     `json:"hero_title"`
	HeroSubtitle string     `json:"hero_subtitle"`
	IntroTitle   string     `json:"intro_title"`
	IntroDesc    string     `json:"intro_desc"`
	Items        []FoodItem `json:"items"`
}
