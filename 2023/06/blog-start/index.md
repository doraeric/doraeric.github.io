# 部落格誕生了！


## 緣起

在畢業後終於有一小段時間時間是徹底屬於自己的了。打開 trello 想把以前的代辦事項處理掉，看到三年多前記下要寫資安 writeup...

...

不是，我怎麼可能記得三年前在解什麼題目！

<br>

其實我一直想要有個可以紀錄技術的地方，讓自己可以複習學過的東西，但覺得很麻煩就沒有弄。<br>
我想要用 markdown 紀錄，主要是為了 coding block 的語法，同時還要可以搜尋。用 hackmd/github 的話，東西散落在不同地方，要搜尋不方便。用 Google Docs 的話沒有 markdown 可以用，搜尋也是不方便。一般的部落格網站也沒有 markdown 可以用。剩下的可能性就是自己架了，結果就一直拖到現在...

而現在正好是難得的空閒時間！要的話肯定是趁現在弄好，於是終於生出來了！實際上也是花了兩個禮拜才調整到覺得可接受的範圍。之後有可能再換其他主題，目前就先這樣吧。

雖然這個部落格是為了寫資安相關 writeup 誕生的，但光設置的過程感覺馬上就可以紀錄下來了。<br>
這裡就把踩過的雷留個紀錄吧！

## 踩雷過程

### Static Site Generator

這是可以幫你把原始碼 (markdown, html, css...) 轉換成對應的網站的工具。有些是我後來才看到的，所以還沒玩到

- [Hugo](https://github.com/gohugoio/hugo)
- [Hexo](https://github.com/hexojs/hexo)
- [VitePress](https://github.com/vuejs/vitepress)
- [Hydejack (Jekyll theme)](https://github.com/hydecorp/hydejack)

Hugo 和 Hexo 算是一個框架，你可以再選擇使用不同的主題 (theme)，他們會幫你建出最後的網站。

Hydejack 是找資料時發現的部落格主題。我原本以為 Jekyll 只能做出很簡陋的網站，沒想到它甚至還有搜尋功能。之後如果想玩的話再來研究吧

### Hugo

使用 Go 開發，宣稱 build 速度最快的，所以一開始就先選它了。但後來發現比起 build 最快，更重要的應該是 build 出來後網站的 user experience 更好才是最重要的，而這部份就要看各個主題作者的功力了。似乎不會對產出的結果做 minify，這個動作是縮小檔案大小，使網站載入速度更快。如果 build 很快但載入很慢那其實沒什麼用。

![Quick in Math Meme](https://images3.memedroid.com/images/UPLOADED973/622c944aba62b.jpeg)

宣稱支援 i18n，但實際功能根本半殘，不會自動 fallback 文章到唯一的語言。假設 A 文章是中文， B 文章是英文，那選擇中文時只會看到 A，選擇英文時只會看到 B。我頂多只是要翻譯選單文字而已，所以為了選單切換語言後可能變成 0 篇文章。

宣稱支援圖片處理，我以為是可以自動壓縮圖片檔案大小，產出多種不同品質的圖檔，讓前端可以動態載入適合的大小。結果只是提供切割或縮放之類的 function 給你呼叫，還不如自己寫 shell script 轉換。（也有可能是要給主題作者用的吧？至少目前的主題中沒看到任何效果）

對主題的部份做個說明。有些主題的 github repo 中會有 exampleSite 的資料夾，如果裝好後什麼都沒看到，就把資料夾裡的東西複製出來，通常就會有些東西。要他們把說明文件寫清楚點好像很困難。

然後我還是覺得 Go template 語法很醜。我不是針對 Go template，~~我是說在座各位 都是xx~~<br>
JSX 很棒啊，要嘛是 html，要嘛是 JavaScript。學學 JSX

優點還是有的啦。像是有個功能是可以根據 git 紀錄自動獲得文章的最後修改時間，這功能我就覺得還不錯。

### Hexo

使用 JavaScript 開發。沒用過不知道效果如何，但比起 Go 更有可能對 build 出來的東西做優化吧？畢竟是前端霸主 JavaScript，處理起來應該比較方便。

### 主題比較

|| [Stack](https://github.com/CaiJimmy/hugo-theme-stack) | [LoveIt](https://github.com/dillonzq/LoveIt) | [VitePress](https://github.com/vuejs/vitepress) | [hydejack](https://github.com/hydecorp/hydejack) |
|-|-|-|-|-|
|版面配置|喜歡|還行||||
|內容顯示|不行|功能豐富|||
|SPA|:x:|:x:|:o:|:o:|

沒認真玩的就先空著。

一開始先試 stack 因為他的版面配置還算喜歡，文章切三欄，網站導覽列及作者在左，TOC 在右。但試用後發現文章內的功能太少，顯示也不好看。包括：文章標題沒有 anchor 可以點擊， coding block 樣式太醜，連用兩個時甚至看不到分界，連結不夠明顯，搜尋功能有 [bug](https://github.com/CaiJimmy/hugo-theme-stack/issues/832)，文章的 html title 不會自動包含網站名稱。後來就放棄了。

目前看到 coding block 樣式最漂亮的是 hexo 的 [shoka](https://github.com/amehime/hexo-theme-shoka)，但這個主題的網站特效太多超 lag，完全不考慮。

LoveIt 功能算是蠻完整的，不過我有再上些 patch，像是文章的時間滑鼠停留在上面會顯示完整時間，修改首頁的頭像說明文字、連結，搜尋功能 lunr 原本的配置也不好用。還有一點，license 的部份是全站的設置，邏輯上來說應該要可以每篇文章個別設置，雖然我都不太在乎就是了。

![General GitHub Users Meme](https://github.com/doraeric/doraeric.github.io/assets/16789570/d9bb5341-912c-40af-a7d8-c8bb99fc07c8)

最後就是 LoveIt 主題並非 Single Page Application (SPA)。可以在這兩個網站 [1](https://hugoloveit.com/), [2](https://hydejack.com/docs/) 點擊連結，感受切換不同頁面時的效果。SPA 切換頁面會比較流暢，非必要，但有會更好。

### 部屬

原本就打算架在 GitHub Pages 上，不過我找了一陣子才看到我要的功能 [Deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#deploy-keys)，怎麼不和 access token 之類的說明放一起呢...

有 Deploy key 就可以從任何環境中推到 GitHub 上，不過有個刪除上的 [bug](https://github.com/orgs/community/discussions/21993)，有打算用的話要先看一下這個 bug。

## ToDo

圖片的部份還沒決定到底要怎麼處理。看到有些人用外部服務像是 [imgur](https://imgur.com/) 或是 [cloudinary](https://cloudinary.com/)，也有直接放在 GitHub 上的，不用怕服務收掉，但這樣 repo 的大小就會比較大。好難抉擇啊...

這篇就紀錄到這。之後有文章的話差不多也是這樣吧，各種廢話+迷因+筆記～

