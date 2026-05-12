package models

import "time"

type RedCultureItem struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Image       string    `json:"image"`
	Year        string    `json:"year"`
	SortOrder   int       `json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RedCultureData struct {
	HeroTitle   string            `json:"hero_title"`
	HeroSubtitle string           `json:"hero_subtitle"`
	IntroTitle  string           `json:"intro_title"`
	IntroDesc   string           `json:"intro_desc"`
	Items       []RedCultureItem `json:"items"`
	Timeline    []TimelineItem   `json:"timeline"`
}

type TimelineItem struct {
	Year  string `json:"year"`
	Title string `json:"title"`
	Desc  string `json:"desc"`
}
