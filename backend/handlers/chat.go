package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"lotus-lake-backend/config"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type ChatResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}

var htmlTagRegex = regexp.MustCompile(`<[^>]*>`)

func sanitizeInput(input string) string {
	input = strings.TrimSpace(input)
	input = htmlTagRegex.ReplaceAllString(input, "")
	return input
}

func searchKnowledge(query string) (string, bool) {
	spots := []struct{ Name, Location, Description string }{
		{Name: "莲花湖湿地公园", Location: "四川省达州市通川区西北角", Description: "国家AAAA级景区，达州城市后花园。始建于1976年，因湖中天然石槽如莲花绽放而得名。水域面积1400余亩，湖岸线长21公里。2017年投资26亿元打造成海绵城市样板，湖区绿化覆盖率98%，水质常年保持III类以上。日均接待游客5000余人，是集生态保护、休闲娱乐、文化体验于一体的综合性湿地公园，被誉为\"城市氧吧\"。"},
		{Name: "八台山风景区", Location: "四川省达州市万源市东南部", Description: "国家级地质公园、国家AAAA级景区，海拔2272.3米大巴山第二峰。因八层梯状地貌得名，孤峰兀立，云雾缠绕，形成日出、佛光、云海、云瀑等气象奇观，有\"川东小峨眉\"美誉。年均170天可见佛光，是四川迎接第一缕阳光的地方。景区设玻璃栈道、滑雪场等体验项目，四季皆宜。"},
		{Name: "巴山大峡谷", Location: "四川省达州市宣汉县东北部", Description: "国家AAAA级景区，大巴山国家地质公园。峡谷全长140公里，海拔高差2000米，集喀斯特地貌、峡谷景观、巴人文化于一体。有桃溪谷、罗盘顶、大象洞等核心景区，秋季红叶如霞，冬季天然滑雪场开放。是中国巴文化的核心发祥地，传承土家非遗民俗，被誉为\"川东小九寨\"。"},
		{Name: "梦里巴国·三里古街", Location: "四川省达州市达川区南外三里坪", Description: "川东北首个巴文化沉浸式商业街区，全长700米，占地60亩，以\"梦里巴国\"为主题。历史可追溯至明代，建筑以川东秦汉风格为主，被誉为\"达州版小故宫\"。街上的巴人历史文化馆投资4亿元，气势恢宏，夜晚灯火璀璨，是体验巴人文化、品尝川东美食的绝佳去处。"},
		{Name: "真佛山风景区", Location: "四川省达州市达川区福善镇", Description: "国家AAAA级景区，集\"儒、佛、道\"三教合一的文化旅游胜地。位于达川区福善镇，距市区35公里，海拔710米。始建于清道光年间，相传蒋德化以孝行善闻名，被尊为\"蒋活佛\"。核心景区德化寺占地400余亩，玉佛寺双塔高21层为全国之最。每年农历六月十九庙会期间，数万香客云集。"},
	}

	redCulture := []struct{ Name, Location, Description string }{
		{Name: "张爱萍故居", Location: "通川区", Description: "中国导弹之父张爱萍将军故居，全面展示了这位伟大革命家波澜壮阔的一生。"},
		{Name: "红军纪念馆", Location: "达川区", Description: "收藏了大量珍贵的革命文物，记录着红四方面军在达州的战斗历程。"},
		{Name: "万源保卫战遗址", Location: "万源市", Description: "1934年红军在此与敌军展开殊死搏斗，是川陕革命根据地最惨烈的战役之一。"},
		{Name: "列宁主义街", Location: "达川区石桥镇", Description: "被誉为'中国红色第一街'，保存着完好的红军石刻标语群。"},
	}

	foodCulture := []struct{ Name, Tags, Description string }{
		{Name: "灯影牛肉", Tags: "麻辣 · 特产 · 非遗", Description: "达州特产，国家级非物质文化遗产。精选黄牛后腿腱子肉，老师傅手工片至2mm以下薄如蝉翼，透光见影。经腌、烘、蒸、炸等多道工序，成品红亮油润，酥脆化渣，麻辣回甜，越嚼越香。"},
		{Name: "麻婆豆腐", Tags: "麻辣 · 经典 · 川菜", Description: "川菜经典代表，达州人餐桌上的家常滋味。豆腐嫩滑入味，牛肉臊子酥香，豆瓣红油香辣，麻、辣、烫、鲜、嫩、整、酥、活八字诀缺一不可，下饭堪称一绝。"},
		{Name: "东柳鱼头", Tags: "酸辣 · 鲜香 · 地方特色", Description: "达州东柳醪糟闻名遐迩，这道东柳鱼头则融合了当地河鲜的鲜美。选用新鲜鲢鱼头，配以泡椒、酸菜独家调味，鱼肉细嫩，汤汁酸辣鲜香，入口开胃，令舌尖难忘。"},
		{Name: "包面", Tags: "麻辣 · 小吃 · 早餐", Description: "达州特色小吃，又称\"抄手\"。皮薄馅嫩，形如元宝。骨汤熬制数小时，汤鲜味美；红油辣子香而不燥，拌入馅中，麻辣鲜香，一碗下肚暖彻身心。"},
		{Name: "徐鸭子", Tags: "卤味 · 老字号 · 手撕", Description: "达州本地老字号品牌，先卤后烤的经典工艺。外皮干香油亮，肉质紧实有嚼劲，手撕食用香酥化渣。麻辣与五香两种口味各具特色，是追剧下酒的必备零嘴，也是馈赠亲友的达州味道。"},
		{Name: "酸辣鸡丁", Tags: "酸辣 · 下饭 · 江湖菜", Description: "达州江湖菜代表之一，鸡肉切丁大火爆炒。优选土鸡腿肉，加泡椒、酸萝卜、野山椒猛火爆炒，鸡肉嫩弹紧实，酸辣滋味直冲鼻腔，配米饭吃堪称\"米饭杀手\"。"},
	}

	q := strings.TrimSpace(query)

	for _, s := range spots {
		if strings.Contains(s.Name, q) || strings.Contains(q, s.Name) {
			return fmt.Sprintf("%s位于%s。%s", s.Name, s.Location, s.Description), true
		}
	}

	for _, r := range redCulture {
		if strings.Contains(r.Name, q) || strings.Contains(q, r.Name) {
			return fmt.Sprintf("%s位于%s。%s", r.Name, r.Location, r.Description), true
		}
	}

	for _, f := range foodCulture {
		if strings.Contains(f.Name, q) || strings.Contains(q, f.Name) {
			return fmt.Sprintf("%s（%s）：%s", f.Name, f.Tags, f.Description), true
		}
	}

	keywords := map[string]string{
		"景点":    "达州市的主要景点包括：莲花湖湿地公园（国家AAAA级景区）、八台山风景区（国家级地质公园）、巴山大峡谷（国家AAAA级景区）、梦里巴国·三里古街（达州版小故宫）、真佛山风景区（儒佛道三教合一）。",
		"美食":    "达州特色美食有：灯影牛肉（国家级非物质文化遗产）、麻婆豆腐、东柳鱼头、包面、徐鸭子、酸辣鸡丁等。",
		"红色文化": "达州红色文化景点包括：张爱萍故居（导弹之父）、红军纪念馆、万源保卫战遗址、列宁主义街（中国红色第一街）。",
		"景区":    "达州主要景区有：莲花湖湿地公园、八台山风景区、巴山大峡谷、梦里巴国·三里古街、真佛山风景区等。",
		"莲花湖":  "莲花湖湿地公园位于四川省达州市通川区西北角。国家AAAA级景区，达州城市后花园。始建于1976年，因湖中天然石槽如莲花绽放而得名。水域面积1400余亩，湖岸线长21公里。",
		"八台山":  "八台山风景区位于四川省达州市万源市东南部。国家级地质公园、国家AAAA级景区，海拔2272.3米大巴山第二峰。因八层梯状地貌得名，有\"川东小峨眉\"美誉。",
		"巴山大峡谷": "巴山大峡谷位于四川省达州市宣汉县东北部。国家AAAA级景区，峡谷全长140公里，海拔高差2000米，集喀斯特地貌、峡谷景观、巴人文化于一体。有桃溪谷、罗盘顶、大象洞等核心景区，被誉为\"川东小九寨\"。",
		"三里古街": "梦里巴国·三里古街位于四川省达州市达川区南外三里坪。川东北首个巴文化沉浸式商业街区，全长700米，被誉为\"达州版小故宫\"。",
		"真佛山":  "真佛山风景区位于四川省达州市达川区福善镇。国家AAAA级景区，集\"儒、佛、道\"三教合一的文化旅游胜地。",
		"张爱萍":  "张爱萍故居位于通川区，是中国导弹之父张爱萍将军故居，全面展示了这位伟大革命家波澜壮阔的一生。",
		"红军":    "红军纪念馆位于达川区，收藏了大量珍贵的革命文物，记录着红四方面军在达州的战斗历程。",
		"万源":    "万源保卫战遗址位于万源市，1934年红军在此与敌军展开殊死搏斗，是川陕革命根据地最惨烈的战役之一。",
		"列宁":    "列宁主义街位于达川区石桥镇，被誉为'中国红色第一街'，保存着完好的红军石刻标语群。",
		"灯影牛肉": "灯影牛肉是达州特产，国家级非物质文化遗产。精选黄牛后腿腱子肉，老师傅手工片至2mm以下薄如蝉翼，透光见影。成品红亮油润，酥脆化渣，麻辣回甜，越嚼越香。",
		"麻婆":    "麻婆豆腐是川菜经典代表，达州人餐桌上的家常滋味。豆腐嫩滑入味，牛肉臊子酥香，豆瓣红油香辣。",
		"包面":    "包面是达州特色小吃，又称\"抄手\"。皮薄馅嫩，形如元宝。骨汤熬制数小时，汤鲜味美；红油辣子香而不燥，麻辣鲜香。",
		"徐鸭子":  "徐鸭子是达州本地老字号品牌，先卤后烤的经典工艺。外皮干香油亮，肉质紧实有嚼劲，手撕食用香酥化渣。",
		"电话":    "景区客服电话：0818-1234567",
		"门票":    "莲花湖大部分区域免费开放，部分项目收费。开放时间全天开放。",
	}

	for keyword, answer := range keywords {
		if strings.Contains(q, keyword) || strings.Contains(keyword, q) {
			return answer, true
		}
	}

	return "", false
}

func buildKnowledgeBase() string {
	var sb strings.Builder

	spots := []struct{ Name, Location, Description string }{
		{Name: "莲花湖湿地公园", Location: "四川省达州市通川区西北角", Description: "国家AAAA级景区，达州城市后花园。始建于1976年，因湖中天然石槽如莲花绽放而得名。水域面积1400余亩，湖岸线长21公里。2017年投资26亿元打造成海绵城市样板，湖区绿化覆盖率98%，水质常年保持III类以上。日均接待游客5000余人，是集生态保护、休闲娱乐、文化体验于一体的综合性湿地公园，被誉为\"城市氧吧\"。"},
		{Name: "八台山风景区", Location: "四川省达州市万源市东南部", Description: "国家级地质公园、国家AAAA级景区，海拔2272.3米大巴山第二峰。因八层梯状地貌得名，孤峰兀立，云雾缠绕，形成日出、佛光、云海、云瀑等气象奇观，有\"川东小峨眉\"美誉。年均170天可见佛光，是四川迎接第一缕阳光的地方。景区设玻璃栈道、滑雪场等体验项目，四季皆宜。"},
		{Name: "巴山大峡谷", Location: "四川省达州市宣汉县东北部", Description: "国家AAAA级景区，大巴山国家地质公园。峡谷全长140公里，海拔高差2000米，集喀斯特地貌、峡谷景观、巴人文化于一体。有桃溪谷、罗盘顶、大象洞等核心景区，秋季红叶如霞，冬季天然滑雪场开放。是中国巴文化的核心发祥地，传承土家非遗民俗，被誉为\"川东小九寨\"。"},
		{Name: "梦里巴国·三里古街", Location: "四川省达州市达川区南外三里坪", Description: "川东北首个巴文化沉浸式商业街区，全长700米，占地60亩，以\"梦里巴国\"为主题。历史可追溯至明代，建筑以川东秦汉风格为主，被誉为\"达州版小故宫\"。街上的巴人历史文化馆投资4亿元，气势恢宏，夜晚灯火璀璨，是体验巴人文化、品尝川东美食的绝佳去处。"},
		{Name: "真佛山风景区", Location: "四川省达州市达川区福善镇", Description: "国家AAAA级景区，集\"儒、佛、道\"三教合一的文化旅游胜地。位于达川区福善镇，距市区35公里，海拔710米。始建于清道光年间，相传蒋德化以孝行善闻名，被尊为\"蒋活佛\"。核心景区德化寺占地400余亩，玉佛寺双塔高21层为全国之最。每年农历六月十九庙会期间，数万香客云集。"},
	}

	redCulture := []struct{ Name, Location, Description string }{
		{Name: "张爱萍故居", Location: "通川区", Description: "中国导弹之父张爱萍将军故居，全面展示了这位伟大革命家波澜壮阔的一生。"},
		{Name: "红军纪念馆", Location: "达川区", Description: "收藏了大量珍贵的革命文物，记录着红四方面军在达州的战斗历程。"},
		{Name: "万源保卫战遗址", Location: "万源市", Description: "1934年红军在此与敌军展开殊死搏斗，是川陕革命根据地最惨烈的战役之一。"},
		{Name: "列宁主义街", Location: "达川区石桥镇", Description: "被誉为'中国红色第一街'，保存着完好的红军石刻标语群。"},
	}

	foodCulture := []struct{ Name, Tags, Description string }{
		{Name: "灯影牛肉", Tags: "麻辣 · 特产 · 非遗", Description: "达州特产，国家级非物质文化遗产。精选黄牛后腿腱子肉，老师傅手工片至2mm以下薄如蝉翼，透光见影。经腌、烘、蒸、炸等多道工序，成品红亮油润，酥脆化渣，麻辣回甜，越嚼越香。"},
		{Name: "麻婆豆腐", Tags: "麻辣 · 经典 · 川菜", Description: "川菜经典代表，达州人餐桌上的家常滋味。豆腐嫩滑入味，牛肉臊子酥香，豆瓣红油香辣，麻、辣、烫、鲜、嫩、整、酥、活八字诀缺一不可，下饭堪称一绝。"},
		{Name: "东柳鱼头", Tags: "酸辣 · 鲜香 · 地方特色", Description: "达州东柳醪糟闻名遐迩，这道东柳鱼头则融合了当地河鲜的鲜美。选用新鲜鲢鱼头，配以泡椒、酸菜独家调味，鱼肉细嫩，汤汁酸辣鲜香，入口开胃，令舌尖难忘。"},
		{Name: "包面", Tags: "麻辣 · 小吃 · 早餐", Description: "达州特色小吃，又称\"抄手\"。皮薄馅嫩，形如元宝。骨汤熬制数小时，汤鲜味美；红油辣子香而不燥，拌入馅中，麻辣鲜香，一碗下肚暖彻身心。"},
		{Name: "徐鸭子", Tags: "卤味 · 老字号 · 手撕", Description: "达州本地老字号品牌，先卤后烤的经典工艺。外皮干香油亮，肉质紧实有嚼劲，手撕食用香酥化渣。麻辣与五香两种口味各具特色，是追剧下酒的必备零嘴，也是馈赠亲友的达州味道。"},
		{Name: "酸辣鸡丁", Tags: "酸辣 · 下饭 · 江湖菜", Description: "达州江湖菜代表之一，鸡肉切丁大火爆炒。优选土鸡腿肉，加泡椒、酸萝卜、野山椒猛火爆炒，鸡肉嫩弹紧实，酸辣滋味直冲鼻腔，配米饭吃堪称\"米饭杀手\"。"},
	}

	sb.WriteString("\n【景点信息】\n")
	for _, s := range spots {
		sb.WriteString(fmt.Sprintf("- %s：位于%s。%s\n", s.Name, s.Location, s.Description))
	}

	sb.WriteString("\n【红色文化】\n")
	for _, r := range redCulture {
		sb.WriteString(fmt.Sprintf("- %s：位于%s。%s\n", r.Name, r.Location, r.Description))
	}

	sb.WriteString("\n【美食文化】\n")
	for _, f := range foodCulture {
		sb.WriteString(fmt.Sprintf("- %s（%s）：%s\n", f.Name, f.Tags, f.Description))
	}

	return sb.String()
}

func ChatWithAssistant(c *gin.Context) {
	cfg := c.MustGet("config").(*config.Config)

	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ChatResponse{Error: "无效的请求"})
		return
	}

	sanitizedMessage := sanitizeInput(req.Message)

	if len(sanitizedMessage) == 0 {
		c.JSON(http.StatusBadRequest, ChatResponse{Error: "请输入有效的问题"})
		return
	}

	if len(sanitizedMessage) > 1000 {
		c.JSON(http.StatusBadRequest, ChatResponse{Error: "问题过长，请控制在1000字以内"})
		return
	}

	if answer, found := searchKnowledge(sanitizedMessage); found {
		log.Printf("CHAT: query=%q found=%v answer=%q", sanitizedMessage, found, answer)
		c.JSON(http.StatusOK, ChatResponse{Response: answer})
		return
	}
	log.Printf("CHAT: query=%q NOT FOUND in knowledge base", sanitizedMessage)

	apiKey := cfg.OpenAIKey
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Response: "抱歉，AI服务暂未配置。请联系管理员配置API密钥。\n\n您也可以拨打景区客服电话：0818-1234567 咨询。",
		})
		return
	}

	knowledgeBase := buildKnowledgeBase()

	systemPrompt := fmt.Sprintf(`你是达州莲花湖景区的智能导游"小莲"。

【你必须严格遵守的规则】
游客问什么，你只能回答知识库中**完全匹配**的内容。
如果游客问的地方/美食/景点名称在下面的【知识库】中存在，你就按格式回答。
如果不存在，或者你不确定，**只能且必须**回复："抱歉，我没有相关信息，建议您拨打景区客服电话0818-1234567咨询。"
**绝对不要**说"据我所知"、"红军"、"遗迹"、"故事"等模糊词语。

【知识库】
%s

【回答格式】
只有当游客问的名称与知识库中的名称完全匹配时，才回答：
名称：XXX
位置：XXX
详情：XXX
其他情况一律回复："抱歉，我没有相关信息，建议您拨打景区客服电话0818-1234567咨询。"`, knowledgeBase)

	requestBody := map[string]interface{}{
		"model": "deepseek-chat",
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": sanitizedMessage},
		},
		"max_tokens": 100,
		"temperature": 0.0,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "请求处理失败"})
		return
	}

	req2, err := http.NewRequest("POST", "https://api.deepseek.com/v1/chat/completions", bytes.NewBuffer(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "请求创建失败"})
		return
	}

	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req2)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Response: fmt.Sprintf("抱歉，AI服务暂时无法访问。请稍后再试，或拨打客服电话0818-1234567咨询。\n\n错误信息：%v", err),
		})
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "响应解析失败"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, ChatResponse{
			Response: "抱歉，AI服务暂时不可用。请稍后再试，或拨打客服电话0818-1234567咨询。",
		})
		return
	}

	choices, ok := result["choices"].([]interface{})
	if !ok || len(choices) == 0 {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "未获取到有效响应"})
		return
	}

	choice, ok := choices[0].(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "响应格式错误"})
		return
	}

	message, ok := choice["message"].(map[string]interface{})
	if !ok {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "消息解析失败"})
		return
	}

	content, ok := message["content"].(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, ChatResponse{Error: "内容解析失败"})
		return
	}

	c.JSON(http.StatusOK, ChatResponse{Response: content})
}
