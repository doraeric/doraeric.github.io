# Android OTG 手機對接傳檔案


沒錯，就跟看到的圖一樣，兩隻手機直接用 Type-C 對接就可以傳檔案了！

最近在研究用手機和平板代替帶筆電出門的可行性，再加上有看到別人直接這樣用，所以測試一下到底要怎麼弄。我之前只有偶然成功觸發過，後來又傳不了檔案，所以設定沒調對的話是用不了的。

先說測試出來的重點：

1. 兩隻手機必須擔任不同角色，一隻當電腦，一隻當外接 usb
2. 當電腦的那隻手機要負責提供電源，不要選到檔案傳輸
3. 當外接 usb 的那隻手機要選檔案傳輸的選項
4. 當電腦的那隻手機要用 android **內建的檔案瀏覽器**才有權限可以直接看到另一隻手機的檔案
5. 只有當電腦的那隻手機可以同時看到兩隻手機的檔案，當外接的那隻看不到另一隻

我用詞可能沒有很精確，反正重要的是聽的懂就好

測試用的兩隻手機是 xperia 和 pixel，分別是 android 8 和 13。有可能是 xperia 版本比較舊，所以雙向溝通的部份沒那麼順利，但設定調對一樣可以通。

## Xperia <- Pixel

假設 xperia 這隻當電腦，pixel 這隻當外接的

- xperia 要選擇「提供電源」
- pixel 的 usb 用途選擇「檔案轉移 / Android Auto」
- pixel 中還有個「USB 的控制裝置」，選「這個裝置」

![case 1](https://github.com/doraeric/doraeric.github.io/assets/16789570/fe82d863-3e31-48b2-b8ca-23f06d9783ca)

「USB 的控制裝置」找到的英文原文是 "USB controlled by"，但不管中文還是英文都聽不太懂它的意思。我自己是理解成「USB 外接裝置是...」，感覺比較白話

Xperia 可以找到一個內建叫「檔案」的應用程式，打開來可以看到 pixel 上的檔案。

**注意**：必須是內建的才有系統的權限，從 Google Play 安裝看起來差不多的程式是沒用的。

![xperia-file](https://github.com/doraeric/doraeric.github.io/assets/16789570/c6826456-f75b-49b4-a14e-1efcf5dfd7b4)

## Pixel <- Xperia

現在反過來，pixel 當電腦，xperia 當外接的

- xperia 選「檔案傳輸」
- pixel 的 USB 的控制裝置選「已連接的裝置」

這時候其實 pixel 會自動禁用「USB 用途」的選項，你也沒得選。

![case 2](https://github.com/doraeric/doraeric.github.io/assets/16789570/6491f25d-1f47-4e54-83ac-9269bd34b209)

再來就是神奇的部份了！pixel 內建的檔案瀏覽器其實沒有任何啟動的 icon，也就是你只能等手機自己跳出系統的檔案應用程式，沒辦法手動直接啟動它。如果你把那個自動跳出的檔案程式拉掉（清掉）的話，也只能重插 USB 希望它跳出來。到底？？

![pixel-file](https://github.com/doraeric/doraeric.github.io/assets/16789570/60e90f4e-8d0a-4338-9e5d-5c4494e783eb)

## 測試過程

還有些不太重要的過程。就是測試中只能從 xperia 那隻切換角色，在 pixel 上切換「USB 的控制裝置」會顯示無法切換，這就是我說的雙向溝通好像不太順利的部份。而且 xperia 那隻其實沒有 USB 控制裝置的選項，要直接選到對的 USB 用途。不知道是不是 android 版本比較舊的關係。

## 第三方檔案程式

前面說只有系統內建的檔案程式才有權限看到，但其實第三方的程式可以「呼叫」出內建的檔案程式，設定好後也是可以讀取的，算是比較間接的方式。

我自己是常用 [MiXplorer](https://mixplorer.com/) 這個管理檔案。在他們的[說明](https://forum.xda-developers.com/t/mixplorer-q-a-and-faq-user-manual.3308582/page-94#post-85878051)中，似乎將那個內建的檔案瀏覽器稱為 Document Provider。

在把線接好、USB 選好後，開啟 mix

1. 側邊欄
2. 右上角 -> Add storage
3. Document provider (USB OTG, ...)
4. 找到另一隻手機的空間，選取

它會新增一個書籤，點開就可以看到檔案。

如果要刪除書籤，把書籤項目往右滑可以看到刪除選項（個人覺得這 UX 實在不太好啊，應該是要長按才對吧）

不知道是不是 android 的系統限制讓第三方程式無法直接看到其他的檔案空間。

## iOS

最後再測試 android 對接 iPad。結論是 android 可以讀 iPad，iPad 不能讀 android，嘻嘻。不過之前看過有人給 iPhone 讀 OTG 隨身碟，可能只是我沒測出來怎麼用吧。

USB 選法規則同上，android 當電腦。選好後通知欄有個 Android 系統的通知「已連線至 iPad 輕觸即可查看檔案」。選「媒體傳輸通訊協定主機」會直接跳出系統的檔案程式，可以看到 DCIM 資料夾和照片，但看不到 iPad 上各個程式的檔案。

