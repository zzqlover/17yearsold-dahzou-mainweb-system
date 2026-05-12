package database

import (
	"encoding/json"
	"fmt"
	"lotus-lake-backend/config"
	"lotus-lake-backend/models"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Store struct {
	Spots         []models.Spot
	News          []models.News
	Slides        []models.Slide
	Admins        []models.Admin
	RedCulture    []models.RedCultureItem
	ScenicCulture []models.ScenicCultureItem
	FoodCulture   []models.FoodItem
	IPRecords     []models.IPRecord
	mu            sync.RWMutex
}

var DB *Store
var dataDir = "./data"

func Initialize(cfg *config.Config) error {
	DB = &Store{}

	workDir, _ := os.Getwd()
	execPath, _ := os.Executable()
	execDir := filepath.Dir(execPath)

	if execPath == "" || filepath.Ext(execPath) == ".go" || execDir == "" || execDir == "." {
		workDir, _ = os.Getwd()
	} else {
		workDir = execDir
	}

	if envRoot := os.Getenv("APP_ROOT"); envRoot != "" {
		workDir = envRoot
	}

	dataDir = filepath.Join(workDir, "data")

	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		if err := os.MkdirAll(dataDir, 0755); err != nil {
			return fmt.Errorf("failed to create data directory: %w", err)
		}
		seedDefaultAdmin()
		seedSampleData()
		saveAllData()
	} else {
		loadAllData()
		if len(DB.Admins) == 0 || DB.Admins[0].PasswordHash == "" {
			seedDefaultAdmin()
			saveAllData()
		}
	}

	log.Println("Database initialized successfully")
	return nil
}

func loadAllData() {
	loadJSON(filepath.Join(dataDir, "spots.json"), &DB.Spots)
	loadJSON(filepath.Join(dataDir, "news.json"), &DB.News)
	loadJSON(filepath.Join(dataDir, "slides.json"), &DB.Slides)
	loadJSON(filepath.Join(dataDir, "admins.json"), &DB.Admins)
	loadJSON(filepath.Join(dataDir, "redculture.json"), &DB.RedCulture)
	loadJSON(filepath.Join(dataDir, "scenicculture.json"), &DB.ScenicCulture)
	loadJSON(filepath.Join(dataDir, "foodculture.json"), &DB.FoodCulture)
	loadJSON(filepath.Join(dataDir, "ip_records.json"), &DB.IPRecords)
}

func loadJSON(filename string, v interface{}) {
	data, err := os.ReadFile(filename)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("Warning: failed to read %s: %v", filename, err)
		}
		return
	}
	if err := json.Unmarshal(data, v); err != nil {
		log.Printf("Warning: failed to parse %s: %v", filename, err)
	}
}

func saveAllData() error {
	saveJSON(filepath.Join(dataDir, "spots.json"), DB.Spots)
	saveJSON(filepath.Join(dataDir, "news.json"), DB.News)
	saveJSON(filepath.Join(dataDir, "slides.json"), DB.Slides)
	saveJSON(filepath.Join(dataDir, "admins.json"), DB.Admins)
	saveJSON(filepath.Join(dataDir, "redculture.json"), DB.RedCulture)
	saveJSON(filepath.Join(dataDir, "scenicculture.json"), DB.ScenicCulture)
	saveJSON(filepath.Join(dataDir, "foodculture.json"), DB.FoodCulture)
	saveJSON(filepath.Join(dataDir, "ip_records.json"), DB.IPRecords)
	return nil
}

func saveJSON(filename string, v interface{}) error {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filename, data, 0644)
}

func (s *Store) CreateSpot(spot *models.Spot) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	spot.ID = uint(len(s.Spots) + 1)
	spot.CreatedAt = time.Now()
	s.Spots = append(s.Spots, *spot)
	return saveJSON(filepath.Join(dataDir, "spots.json"), s.Spots)
}

func (s *Store) GetSpots() []models.Spot {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.Spots
}

func (s *Store) GetSpot(id uint) *models.Spot {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for i := range s.Spots {
		if s.Spots[i].ID == id {
			return &s.Spots[i]
		}
	}
	return nil
}

func (s *Store) UpdateSpot(id uint, spot *models.Spot) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.Spots {
		if s.Spots[i].ID == id {
			spot.ID = id
			spot.UpdatedAt = time.Now()
			s.Spots[i] = *spot
			return saveJSON(filepath.Join(dataDir, "spots.json"), s.Spots)
		}
	}
	return fmt.Errorf("spot not found")
}

func (s *Store) DeleteSpot(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.Spots {
		if s.Spots[i].ID == id {
			s.Spots = append(s.Spots[:i], s.Spots[i+1:]...)
			return saveJSON(filepath.Join(dataDir, "spots.json"), s.Spots)
		}
	}
	return fmt.Errorf("spot not found")
}

func (s *Store) CreateNews(news *models.News) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	news.ID = uint(len(s.News) + 1)
	news.CreatedAt = time.Now()
	s.News = append(s.News, *news)
	return saveJSON(filepath.Join(dataDir, "news.json"), s.News)
}

func (s *Store) GetNews() []models.News {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.News
}

func (s *Store) GetNewsDetail(id uint) *models.News {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for i := range s.News {
		if s.News[i].ID == id {
			return &s.News[i]
		}
	}
	return nil
}

func (s *Store) UpdateNews(id uint, news *models.News) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.News {
		if s.News[i].ID == id {
			news.ID = id
			news.UpdatedAt = time.Now()
			s.News[i] = *news
			return saveJSON(filepath.Join(dataDir, "news.json"), s.News)
		}
	}
	return fmt.Errorf("news not found")
}

func (s *Store) DeleteNews(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.News {
		if s.News[i].ID == id {
			s.News = append(s.News[:i], s.News[i+1:]...)
			return saveJSON(filepath.Join(dataDir, "news.json"), s.News)
		}
	}
	return fmt.Errorf("news not found")
}

func (s *Store) CreateSlide(slide *models.Slide) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	slide.ID = uint(len(s.Slides) + 1)
	slide.CreatedAt = time.Now()
	s.Slides = append(s.Slides, *slide)
	return saveJSON(filepath.Join(dataDir, "slides.json"), s.Slides)
}

func (s *Store) GetSlides() []models.Slide {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.Slides
}

func (s *Store) UpdateSlide(id uint, slide *models.Slide) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.Slides {
		if s.Slides[i].ID == id {
			slide.ID = id
			slide.UpdatedAt = time.Now()
			s.Slides[i] = *slide
			return saveJSON(filepath.Join(dataDir, "slides.json"), s.Slides)
		}
	}
	return fmt.Errorf("slide not found")
}

func (s *Store) DeleteSlide(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.Slides {
		if s.Slides[i].ID == id {
			s.Slides = append(s.Slides[:i], s.Slides[i+1:]...)
			return saveJSON(filepath.Join(dataDir, "slides.json"), s.Slides)
		}
	}
	return fmt.Errorf("slide not found")
}

func (s *Store) GetRedCultureItems() []models.RedCultureItem {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.RedCulture
}

func (s *Store) CreateRedCultureItem(item *models.RedCultureItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	item.ID = uint(len(s.RedCulture) + 1)
	item.CreatedAt = time.Now()
	s.RedCulture = append(s.RedCulture, *item)
	return saveJSON(filepath.Join(dataDir, "redculture.json"), s.RedCulture)
}

func (s *Store) UpdateRedCultureItem(id uint, item *models.RedCultureItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.RedCulture {
		if s.RedCulture[i].ID == id {
			item.ID = id
			item.UpdatedAt = time.Now()
			s.RedCulture[i] = *item
			return saveJSON(filepath.Join(dataDir, "redculture.json"), s.RedCulture)
		}
	}
	return fmt.Errorf("item not found")
}

func (s *Store) DeleteRedCultureItem(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.RedCulture {
		if s.RedCulture[i].ID == id {
			s.RedCulture = append(s.RedCulture[:i], s.RedCulture[i+1:]...)
			return saveJSON(filepath.Join(dataDir, "redculture.json"), s.RedCulture)
		}
	}
	return fmt.Errorf("item not found")
}

func (s *Store) GetScenicCultureItems() []models.ScenicCultureItem {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.ScenicCulture
}

func (s *Store) CreateScenicCultureItem(item *models.ScenicCultureItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	item.ID = uint(len(s.ScenicCulture) + 1)
	item.CreatedAt = time.Now()
	s.ScenicCulture = append(s.ScenicCulture, *item)
	return saveJSON(filepath.Join(dataDir, "scenicculture.json"), s.ScenicCulture)
}

func (s *Store) UpdateScenicCultureItem(id uint, item *models.ScenicCultureItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.ScenicCulture {
		if s.ScenicCulture[i].ID == id {
			item.ID = id
			item.UpdatedAt = time.Now()
			s.ScenicCulture[i] = *item
			return saveJSON(filepath.Join(dataDir, "scenicculture.json"), s.ScenicCulture)
		}
	}
	return fmt.Errorf("item not found")
}

func (s *Store) DeleteScenicCultureItem(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.ScenicCulture {
		if s.ScenicCulture[i].ID == id {
			s.ScenicCulture = append(s.ScenicCulture[:i], s.ScenicCulture[i+1:]...)
			return saveJSON(filepath.Join(dataDir, "scenicculture.json"), s.ScenicCulture)
		}
	}
	return fmt.Errorf("item not found")
}

func (s *Store) GetFoodCultureItems() []models.FoodItem {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.FoodCulture
}

func (s *Store) CreateFoodItem(item *models.FoodItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	item.ID = uint(len(s.FoodCulture) + 1)
	item.CreatedAt = time.Now()
	s.FoodCulture = append(s.FoodCulture, *item)
	return saveJSON(filepath.Join(dataDir, "foodculture.json"), s.FoodCulture)
}

func (s *Store) UpdateFoodItem(id uint, item *models.FoodItem) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.FoodCulture {
		if s.FoodCulture[i].ID == id {
			item.ID = id
			item.UpdatedAt = time.Now()
			s.FoodCulture[i] = *item
			return saveJSON(filepath.Join(dataDir, "foodculture.json"), s.FoodCulture)
		}
	}
	return fmt.Errorf("item not found")
}

func (s *Store) DeleteFoodItem(id uint) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.FoodCulture {
		if s.FoodCulture[i].ID == id {
			s.FoodCulture = append(s.FoodCulture[:i], s.FoodCulture[i+1:]...)
			return saveJSON(filepath.Join(dataDir, "foodculture.json"), s.FoodCulture)
		}
	}
	return fmt.Errorf("item not found")
}

func seedDefaultAdmin() {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	for i := range DB.Admins {
		if DB.Admins[i].Username == "admin" {
			DB.Admins[i].PasswordHash = string(hashedPassword)
			log.Println("Default admin password updated: admin / admin123")
			return
		}
	}
	admin := models.Admin{
		Username:     "admin",
		PasswordHash: string(hashedPassword),
	}
	DB.Admins = append(DB.Admins, admin)
	log.Println("Default admin created: admin / admin123")
}

func seedSampleData() {
	DB.Spots = []models.Spot{
		{ID: 1, Title: "莲花湖湿地公园", Description: "国家AAAA级景区，达州城市后花园。始建于1976年，因湖中天然石槽如莲花绽放而得名。水域面积1400余亩，湖岸线长21公里。2017年投资26亿元打造成海绵城市样板，湖区绿化覆盖率98%，水质常年保持III类以上。日均接待游客5000余人，是集生态保护、休闲娱乐、文化体验于一体的综合性湿地公园，被誉为\"城市氧吧\"。", Location: "四川省达州市通川区西北角", Image: "/uploads/images/莲花户.jpg"},
		{ID: 2, Title: "八台山风景区", Description: "国家级地质公园、国家AAAA级景区，海拔2272.3米大巴山第二峰。因八层梯状地貌得名，孤峰兀立，云雾缠绕，形成日出、佛光、云海、云瀑等气象奇观，有\"川东小峨眉\"美誉。年均170天可见佛光，是四川迎接第一缕阳光的地方。景区设玻璃栈道、滑雪场等体验项目，四季皆宜。", Location: "四川省达州市万源市东南部", Image: "/uploads/images/八台山.jpeg"},
		{ID: 3, Title: "巴山大峡谷", Description: "国家AAAA级景区，大巴山国家地质公园。峡谷全长140公里，海拔高差2000米，集喀斯特地貌、峡谷景观、巴人文化于一体。有桃溪谷、罗盘顶、大象洞等核心景区，秋季红叶如霞，冬季天然滑雪场开放。是中国巴文化的核心发祥地，传承土家非遗民俗，被誉为\"川东小九寨\"。", Location: "四川省达州市宣汉县东北部", Image: "/uploads/images/巴山大峡谷.jpeg"},
		{ID: 4, Title: "梦里巴国·三里古街", Description: "川东北首个巴文化沉浸式商业街区，全长700米，占地60亩，以\"梦里巴国\"为主题。历史可追溯至明代，建筑以川东秦汉风格为主，被誉为\"达州版小故宫\"。街上的巴人历史文化馆投资4亿元，气势恢宏，夜晚灯火璀璨，是体验巴人文化、品尝川东美食的绝佳去处。", Location: "四川省达州市达川区南外三里坪", Image: "/uploads/images/三里古街peg.jpeg"},
		{ID: 5, Title: "真佛山风景区", Description: "国家AAAA级景区，集\"儒、佛、道\"三教合一的文化旅游胜地。位于达川区福善镇，距市区35公里，海拔710米。始建于清道光年间，相传蒋德化以孝行善闻名，被尊为\"蒋活佛\"。核心景区德化寺占地400余亩，玉佛寺双塔高21层为全国之最。每年农历六月十九庙会期间，数万香客云集。", Location: "四川省达州市达川区福善镇", Image: "/uploads/images/真佛山.jpeg"},
	}

	DB.News = []models.News{}

	DB.Slides = []models.Slide{}

	DB.RedCulture = []models.RedCultureItem{
		{ID: 1, Title: "张爱萍故居", Description: "中国导弹之父张爱萍将军故居，全面展示了这位伟大革命家波澜壮阔的一生。", Location: "通川区", Image: "/images/History/张爱萍故居.jpeg", SortOrder: 1},
		{ID: 2, Title: "红军纪念馆", Description: "收藏了大量珍贵的革命文物，记录着红四方面军在达州的战斗历程。", Location: "达川区", Image: "/images/History/红军纪念馆.jpeg", SortOrder: 2},
		{ID: 3, Title: "万源保卫战遗址", Description: "1934年红军在此与敌军展开殊死搏斗，是川陕革命根据地最惨烈的战役之一。", Location: "万源市", Image: "/images/History/万源保卫战.jpeg", SortOrder: 3},
		{ID: 4, Title: "列宁主义街", Description: "被誉为'中国红色第一街'，保存着完好的红军石刻标语群。", Location: "达川区石桥镇", Image: "/images/History/列宁街.jpeg", SortOrder: 4},
	}

	DB.ScenicCulture = []models.ScenicCultureItem{}

	DB.FoodCulture = []models.FoodItem{
		{Title: "灯影牛肉", Description: "达州特产，国家级非物质文化遗产。精选黄牛后腿腱子肉，老师傅手工片至2mm以下薄如蝉翼，透光见影。经腌、烘、蒸、炸等多道工序，成品红亮油润，酥脆化渣，麻辣回甜，越嚼越香。", Tags: "麻辣 · 特产 · 非遗", Image: "/uploads/images/灯影牛肉.jpeg"},
		{Title: "麻婆豆腐", Description: "川菜经典代表，达州人餐桌上的家常滋味。豆腐嫩滑入味，牛肉臊子酥香，豆瓣红油香辣，麻、辣、烫、鲜、嫩、整、酥、活八字诀缺一不可，下饭堪称一绝。", Tags: "麻辣 · 经典 · 川菜", Image: "/uploads/images/麻婆豆腐.jpeg"},
		{Title: "东柳鱼头", Description: "达州东柳醪糟闻名遐迩，这道东柳鱼头则融合了当地河鲜的鲜美。选用新鲜鲢鱼头，配以泡椒、酸菜独家调味，鱼肉细嫩，汤汁酸辣鲜香，入口开胃，令舌尖难忘。", Tags: "酸辣 · 鲜香 · 地方特色", Image: "/uploads/images/鱼头.jpeg"},
		{Title: "包面", Description: "达州特色小吃，又称\"抄手\"。皮薄馅嫩，形如元宝。骨汤熬制数小时，汤鲜味美；红油辣子香而不燥，拌入馅中，麻辣鲜香，一碗下肚暖彻身心。", Tags: "麻辣 · 小吃 · 早餐", Image: "/uploads/images/包面.jpeg"},
		{Title: "徐鸭子", Description: "达州本地老字号品牌，先卤后烤的经典工艺。外皮干香油亮，肉质紧实有嚼劲，手撕食用香酥化渣。麻辣与五香两种口味各具特色，是追剧下酒的必备零嘴，也是馈赠亲友的达州味道。", Tags: "卤味 · 老字号 · 手撕", Image: "/uploads/images/卤鸭头.jpeg"},
		{Title: "酸辣鸡丁", Description: "达州江湖菜代表之一，鸡肉切丁大火爆炒。优选土鸡腿肉，加泡椒、酸萝卜、野山椒猛火爆炒，鸡肉嫩弹紧实，酸辣滋味直冲鼻腔，配米饭吃堪称\"米饭杀手\"。", Tags: "酸辣 · 下饭 · 江湖菜", Image: "/uploads/images/鸡块.jpeg"},
	}
}

func (s *Store) RecordIPFail(ip string) (int, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()

	for i := range s.IPRecords {
		if s.IPRecords[i].IP == ip {
			if now.Sub(s.IPRecords[i].FirstFailAt) > 30*time.Minute {
				s.IPRecords[i].FailCount = 1
				s.IPRecords[i].FirstFailAt = now
				s.IPRecords[i].LastFailAt = now
			} else {
				s.IPRecords[i].FailCount++
				s.IPRecords[i].LastFailAt = now
			}
			saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
			return s.IPRecords[i].FailCount, s.IPRecords[i].Blocked
		}
	}

	record := models.IPRecord{
		ID:          uint(len(s.IPRecords) + 1),
		IP:          ip,
		FailCount:   1,
		FirstFailAt: now,
		LastFailAt:  now,
		Blocked:     false,
		CreatedAt:   now,
	}
	s.IPRecords = append(s.IPRecords, record)
	saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
	return 1, false
}

func (s *Store) GetIPRecord(ip string) *models.IPRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for i := range s.IPRecords {
		if s.IPRecords[i].IP == ip {
			return &s.IPRecords[i]
		}
	}
	return nil
}

func (s *Store) GetAllIPRecords() []models.IPRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.IPRecords
}

func (s *Store) BlockIP(ip string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.IPRecords {
		if s.IPRecords[i].IP == ip {
			s.IPRecords[i].Blocked = true
			s.IPRecords[i].BlockedAt = time.Now()
			saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
			return nil
		}
	}

	record := models.IPRecord{
		ID:        uint(len(s.IPRecords) + 1),
		IP:        ip,
		Blocked:   true,
		BlockedAt: time.Now(),
		CreatedAt: time.Now(),
	}
	s.IPRecords = append(s.IPRecords, record)
	saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
	return nil
}

func (s *Store) UnblockIP(ip string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.IPRecords {
		if s.IPRecords[i].IP == ip {
			s.IPRecords[i].Blocked = false
			s.IPRecords[i].BlockedAt = time.Time{}
			saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
			return nil
		}
	}
	return nil
}

func (s *Store) ResetIPFail(ip string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.IPRecords {
		if s.IPRecords[i].IP == ip {
			s.IPRecords[i].FailCount = 0
			s.IPRecords[i].FirstFailAt = time.Time{}
			s.IPRecords[i].LastFailAt = time.Time{}
			saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
			return
		}
	}
}

func (s *Store) DeleteIP(ip string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.IPRecords {
		if s.IPRecords[i].IP == ip {
			s.IPRecords = append(s.IPRecords[:i], s.IPRecords[i+1:]...)
			saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
			return nil
		}
	}
	return nil
}

func (s *Store) ClearAllIPs() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.IPRecords = []models.IPRecord{}
	saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
}

func (s *Store) BatchBlockIPs(ips []string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	ipSet := make(map[string]bool)
	for _, ip := range ips {
		ipSet[ip] = true
	}

	for i := range s.IPRecords {
		if ipSet[s.IPRecords[i].IP] {
			s.IPRecords[i].Blocked = true
			s.IPRecords[i].BlockedAt = now
		}
	}
	saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
}

func (s *Store) BlockAllIPs() {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for i := range s.IPRecords {
		s.IPRecords[i].Blocked = true
		s.IPRecords[i].BlockedAt = now
	}
	saveJSON(filepath.Join(dataDir, "ip_records.json"), s.IPRecords)
}
