package models

import (
	"time"
)

type News struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Title      string    `json:"title" gorm:"size:200;not null"`
	Summary    string    `json:"summary" gorm:"type:text"`
	Content    string    `json:"content" gorm:"type:text"`
	CoverImage string    `json:"cover_image" gorm:"size:500"`
	Author     string    `json:"author" gorm:"size:50"`
	ViewCount  int       `json:"view_count" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
