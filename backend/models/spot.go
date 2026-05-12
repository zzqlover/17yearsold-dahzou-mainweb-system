package models

import (
	"time"
)

type Spot struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Title        string    `json:"title" gorm:"size:200;not null"`
	Description  string    `json:"description" gorm:"type:text"`
	Content      string    `json:"content" gorm:"type:text"`
	Image       string    `json:"image" gorm:"size:500"`
	Location     string    `json:"location" gorm:"size:200"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
