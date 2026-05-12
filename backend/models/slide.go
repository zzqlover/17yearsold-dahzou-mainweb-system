package models

import (
	"time"
)

type Slide struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"size:200"`
	ImageURL  string    `json:"image_url" gorm:"size:500;not null"`
	LinkURL   string    `json:"link_url" gorm:"size:500"`
	SortOrder int       `json:"sort_order" gorm:"default:0"`
	IsActive  bool      `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
