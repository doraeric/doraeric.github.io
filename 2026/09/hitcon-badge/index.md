# HITCON Badge 逆向挑戰題解題說明


Language: [中文](../hitcon-badge/) | [English](../hitcon-badge-en/)

## 背景

原本在構思題目時，擔心題目太難，想說參考某豹在金盾獎的做法，隨著時間依序放出韌體、程式碼等。

但聽說以前的 BadUSB 挑戰大家都輕鬆破關，再考量年會進行時的忙碌程度，還有聽說獎品很好，希望題目盡量難沒關係（~~以及我懶~~），所以決定就不放出韌體，讓大家自己靠 dump 出來的加上 AI 來解題。結果只有兩位會眾成功解出題目 🥺

如果想要自己體驗解題的，可以準備好 ST-Link 與 PCB badge，使用 [provisioner](https://github.com/john0312/hitcon-pcb-badge/releases/tag/provisioner-v1.0) 燒錄，並選擇想要的挑戰等級

- **困難**：等同活動當時難度，你只有 badge，git repo 在 [y26-challenge-stage0](https://github.com/john0312/hitcon-pcb-badge/tree/y26-challenge-stage0)，以及有一個提示字 `114514`
  - 可以使用手邊的 ST-Link、PCB badge、任何 AI 或其他工具
  - 當時尚未釋出完整版 provisioner
- **中等**：可以額外獲得 [provisioner](https://github.com/john0312/hitcon-pcb-badge/releases/tag/provisioner-v1.0) 頁面中的 `fw.elf` 進行分析
- **簡單**：git repo 切換至 [y26-challenge-stage1](https://github.com/john0312/hitcon-pcb-badge/tree/y26-challenge-stage1) 取得原始碼
  - vault 挑戰原始碼有 flag，但仍需想出正確的互動流程來 leak flag

以下開始解題說明

## 題目一：逆向題

首先要先取得韌體，把 ST-Link 接上 badge 上留好的洞，flash 大小從 repo 中的 `STM32F103CBTX_FLASH.ld` 可得知是 128k，直接 Google 搜尋 "stm32 flash read 128k cmd" 連指令都告訴你了 `st-flash read flash_dump.bin 0x08000000 0x20000`，有的人使用 STM32CubeIDE 也是可以，取得韌體後暫時就不需要 ST-Link 了。

這題原本設計是要隨程式碼釋出得到解題方向，但後來因為另一題直接放 flag 在原始碼所以改給提示字 `114514`。

一開始去給 AI 逆向，或是對 dump 出來的韌體跑 `strings` 指令，肯定會看到一堆關於 ReverseApp 的測試說明，裡面提到說要開啟**麥克風**並讓板子去接收指定歌曲，板子的麥克風收到歌曲經過解析後就可以得到 flag。如果真的照文字敘述和逆向成果重建程式邏輯，輸入指定歌曲，會發現無法解出有意義的字，這是故意設計的。

這邊考驗的不只是逆向能力，而是玩家是否有足夠好的判斷能力。韌體中用大量文字去引導用麥克風解析音訊，但玩家擁有這塊實體板子，硬體是舊的，過去的韌體程式碼也都在 GitHub 上，網路上還有以前的活動說明。綜合這些資訊可以知道：板子上根本**沒有麥克風**，所以這是釣魚的誘餌。這也是針對 AI 設的陷阱：極容易相信 context 中的東西，一旦被污染就會朝錯的方向走，並且不太會對方向進行多方驗證。

影片連結點開是 Rickroll，如果有 stage1 程式碼的，會找到有個 `never::Gonna` 的 app，只看 flash dump 的也可以透過提示 114514 定位到這個 app。如果不靠提示，應該可以自己從 stage0 source 編譯一版，去比對 dump 多了什麼，但這我不確定看不看得出來。經過逆向或閱讀原始碼得知 114514 運算後會變成 `FLAG` 字串，而 payload 是韌體中的 12 個 byte xor UID。UID 是 stm32 晶片出廠時寫入的唯一識別碼，每顆 MCU 都不同。要從電腦讀取板子的 UID，要先知道目標記憶體位置，不同晶片的位置不同，從 GitHub repo 中可以找到晶片是 `STM32F103CBT6`，Google 一下就知道 UID 記憶體位置是 `0x1FFFF7E8`，再用 st-flash 讀取 `st-flash read uid.bin 0x1FFFF7E8 12`，做 xor 就得到 flag 內容

`FLAG{54Y_600cl8Y3}`

[題目原始碼](https://github.com/john0312/hitcon-pcb-badge/blob/y26-challenge-disclose/fw/Core/Hitcon/App/NeverGonna.cc)

## 題目二：Vault App

這題是在會場有個可以互動的基地台，會眾板子當 client 操作作為 server 的基地台。兩邊韌體是相同的，都同時包含 client 與 server，只是根據設定不同決定不同角色，因此逆向時也可以看到 server 邏輯，只是會眾板子中的 flag 是假的，必須要從基地台拿到才行。這題是設計成 pwn 題，但我不想大家還要自己燒韌體寫 payload，弄壞基地台記憶體還要手動重開機，所以只要從基地台 leak flag 就達成了。

題目是玩家初始有 100 元，有 3 個鎖定的物件與對應的鑰匙，#0, #1 的 key 都是 30 元，#2 的 key 是 999 元，真正的 flag 是 #2。設計上沒有留 underflow 的洞。這個 app 有自己管理的記憶體 pool，為了簡單，pool 中每個物件都佔用相同大小，鎖定的物件（內含 flag）、購買後的 key、解鎖的物件、上傳的名字都是放在這個 pool。等等，**上傳的名字**！聽起來就是 buffer overflow，很可惜，這裡也沒留這種洞。記憶體 pool 初始時依序是放著 locked#0, locked#1, locked#2。玩家在背包中對自己擁有的東西可以進行操作："Use", "Discard", "Pin"，pin 住的東西會在主選單出現，讓玩家可以快速操作。不知道各位有沒有想到這裡可能會有什麼問題？如果一個物件被釘選後又被刪除，釘選的地方沒有刪掉，那你就得到一個 use-after-free！ key 在 use 後會對記憶體寫入，把最後一個 byte `key.used` 設為 true。因為 pool 中物件大小相同，這個位置剛好可以覆寫名字結尾的 null byte。

到這邊已經可以開始思考攻擊方式了：

pool 初始狀態如下

```
pool[0] = locked#0
pool[1] = locked#1
pool[2] = locked#2
```

因此目標是釋放 `pool[1]`，再讓 key, name 分配到這個位置。只要讓 name 結尾的 null byte 被覆寫，就能往後讀到 `pool[2]`。

- 要把 key 和 name 控在 `pool[1]`，先買 `key#1` 使用，讓 `locked#1` 被釋放，空出 `pool[1]`
- 買 `key#0` 佔住 `pool[1]`，然後 pin、丟棄
- 接著上傳名字塞滿 `pool[1]`，剩最後面的 null byte。此時 pin 住的 key 指標指向 name 的內容
- 使用 pin 住的 `key#0` 把 null byte 蓋成 `true`
- print name，從 `pool[1]` 開始，一路往後印到 `pool[2]` 的 `locked#2`，leak 出 flag

這時候從 `pool[1]` 開始印字串，但名字的 null byte 已被蓋掉，所以會印到 `pool[2]` 的 locked#2，就可以看到真正的 flag:

`FLAG{H4CK_M30W^._.^}`

完整的設計和 exploit 流程可以在 GitHub 上看[文件](https://github.com/john0312/hitcon-pcb-badge/blob/y26-challenge-disclose/fw/Core/Hitcon/App/VaultApp_design.md)與[原始碼](https://github.com/john0312/hitcon-pcb-badge/blob/y26-challenge-disclose/fw/Core/Hitcon/App/VaultApp.cc)

## 出題心得

現在在做資安研究的，應該都知道現在就是拉霸機時代，題目拿過來給 AI 拉，總會拉出東西，拉不出來就叫 AI 繼續拉，CTF 比賽就像比誰的 token 多。如果只是出題給 AI 拉根本沒意思，所以我針對 AI 故意塞了一大段誤導文字，如果沒有人介入就會卡在這個地方出不去。AI 很會逆向，但「**決定方向**」這件事，**目前**看來 AI 還是無法超越人類，所以逆向題更多的是考 context 解讀：要如何取得韌體、板子上有什麼硬體、要看哪個 function 才對、UID 要怎麼獲得、MCU 型號是什麼，這種問題界定和驗證的過程。而且這也是和一般逆向不同、專屬於這塊板子的逆向挑戰，只讓 AI 看韌體、沒有讀出硬體上的 UID 就解不出來。

Vault 是我想好要用 UAF 和型別混淆後設計出來的，一開始還沒設計好，pin 住的地方也可以 free，變成 double free 漏洞，不過用 AI 審題也很方便，很快就抓到修掉了。兩題最後都用 claude 跑過，oneshot prompt 解不出來才過 😜

最後有兩位會眾解出 vault 🎉

但逆向題沒人解出 😭 有會眾差最後一步沒讀到 UID 很可惜啊，差點就可以解出這題了

難道大家是因為看懂提示就會被知道真實身分而不敢解題嗎（悲

![hint](../hitcon-badge/hint.jpg#center)

