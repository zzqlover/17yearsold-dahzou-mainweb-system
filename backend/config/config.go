package config

import (
	"os"
	"path/filepath"
)

type Config struct {
	Port        string
	Uploads     string
	Database    string
	OpenAIKey   string // DeepSeek API Key
	AmapKey     string // 高德地图 Web端 Key
	WeatherKey   string // 和风天气 API Key
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func Load() *Config {
	workDir, _ := os.Getwd()
	if appRoot := os.Getenv("APP_ROOT"); appRoot != "" {
		workDir = appRoot
	}

	return &Config{
		Port:      getEnv("PORT", "5000"),
		Uploads:   filepath.Join(workDir, "uploads"),
		Database:  filepath.Join(workDir, "data"),
		OpenAIKey: getEnv("OPENAI_API_KEY", ""),
		AmapKey:   getEnv("AMAP_KEY", ""),
		WeatherKey: getEnv("WEATHER_KEY", ""),
	}
}
