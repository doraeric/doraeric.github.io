# 手動更新 Linux Firmware


最近一個禮拜筆電一直偶發當機。當機時 Caps Lock 會動，螢幕不會動，只能強制重開，趁週末修一下。

Framework 13 AI 300 series

```sh
journalctl -b 0
kernel: amdgpu 0000:c1:00.0: amdgpu: MES failed to respond to msg=MISC (WAIT_REG_MEM)
kernel: amdgpu 0000:c1:00.0: amdgpu: failed to reg_write_reg_wait
...
kernel: amdgpu 0000:c1:00.0: amdgpu: MES ring buffer is full.
```

根據錯誤訊息找到類似的

[AMD GPU MES Timeouts Causing System Hangs on Framework Laptop 13 (AMD AI 300 Series) - Framework Laptop 13 / Linux - Framework Community](https://community.frame.work/t/amd-gpu-mes-timeouts-causing-system-hangs-on-framework-laptop-13-amd-ai-300-series/71364/24)

不過不太一樣，後來在 gitlab 上找到真正的問題

[amdgpu: MES ring buffer is full. (Linux 6.18/linux-firmware-20251125) (#4749) · Issue · drm/amd](https://gitlab.freedesktop.org/drm/amd/-/issues/4749)

修法是要裝沒問題版本的 firmware。

## Fix

可以等發行版更新，或手動修。我受不了就手動修了

先確認版本，是 MES 0x83

```sh
sudo cat /sys/kernel/debug/dri/0000:c1:00.0/amdgpu_firmware_info
# MES feature version: 1, firmware version: 0x00000083
```

根據討論串訊息，下載 [amdgpu/gc_11_5_0_mes_2.bin](https://gitlab.com/kernel-firmware/linux-firmware/-/blob/main/amdgpu/gc_11_5_0_mes_2.bin?ref_type=heads)

確認目標位置有備份檔

```sh
md5sum /usr/lib/firmware/amdgpu/gc_11_5_0_mes_2.bin.xz /lib/firmware/amdgpu/gc_11_5_0_mes_2.bin.xz
```

檔案格式

```sh
file /usr/lib/firmware/amdgpu/gc_11_5_0_mes_2.bin.xz
# /usr/lib/firmware/amdgpu/gc_11_5_0_mes_2.bin.xz: XZ compressed data, checksum CRC32
```

壓縮檔案。要指定 crc32，我沒指定預設 crc64 結果無法載入

```sh
xz --check=crc32 gc_11_5_0_mes_2.bin

# move file
sudo mv gc_11_5_0_mes_2.bin.xz /lib/firmware/amdgpu
```

更新 initramfs

> Gemini:
>
> - Ubuntu/Debian: `sudo update-initramfs -u`
> - Fedora/RHEL: `sudo dracut --force`
> - Arch Linux: `sudo mkinitcpio -P`

我只更新一個 kernel，方便弄錯時可以直接切另一個

```sh
ls /etc/mkinitcpio.d
# linux612.preset  linux617.preset
sudo mkinitcpio -p linux617
```

接著重開機就好

可以再確認版本有 rollback，`journalctl` 中也沒有錯誤了

```sh
sudo cat /sys/kernel/debug/dri/0000:c1:00.0/amdgpu_firmware_info
# MES feature version: 1, firmware version: 0x00000080
```

