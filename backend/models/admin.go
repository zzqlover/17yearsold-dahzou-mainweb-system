package models

import (
	"time"
)

type Admin struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Username     string    `json:"username" gorm:"size:50;uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:"size:255;not null"`
	Token        string    `json:"token" gorm:"size:255"`
	CreatedAt    time.Time `json:"created_at"`
}

type IPRecord struct {
	ID          uint      `json:"id"`
	IP          string    `json:"ip"`
	FailCount   int       `json:"fail_count"`
	FirstFailAt time.Time `json:"first_fail_at"`
	LastFailAt  time.Time `json:"last_fail_at"`
	Blocked     bool      `json:"blocked"`
	BlockedAt   time.Time `json:"blocked_at,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
