# HITCON Badge Reverse Challenge Official Solutions


Language: [中文](../hitcon-badge/) | [English](../hitcon-badge-en/)

## Background

When I was originally designing the challenges, I was worried that they might be too difficult. I considered following the approach used by somebody in CSC, gradually releasing the firmware, source code, and other materials over time.

However, I heard that everyone had easily cleared the previous BadUSB challenge. Considering how busy staff are during the conference, and also hearing that the prizes were pretty good, I figured it was fine if the challenges were as difficult as possible (~~and also because I'm lazy~~). So I decided not to release the firmware and instead let everyone dump it themselves and solve the challenges with the help of AI. In the end, only two attendees successfully solved one of the challenges 🥺

If you want to experience the challenges yourself, prepare an ST-Link and a PCB badge, flash it using the [provisioner](https://github.com/john0312/hitcon-pcb-badge/releases/tag/provisioner-v1.0), and choose the challenge difficulty you want.

- **Hard:** Equivalent to the difficulty during the event. You only have the badge, the Git repository at [y26-challenge-stage0](https://github.com/john0312/hitcon-pcb-badge/tree/y26-challenge-stage0), and a hint: `114514`.
  - You may use your own ST-Link, PCB badge, any AI, or any other tools.
  - The full provisioner had not been released at the time.
- **Medium:** In addition to the above, you can obtain the `fw.elf` from the [provisioner](https://github.com/john0312/hitcon-pcb-badge/releases/tag/provisioner-v1.0) release page for analysis.
- **Easy:** Switch the Git repository to [y26-challenge-stage1](https://github.com/john0312/hitcon-pcb-badge/tree/y26-challenge-stage1) to obtain the source code.
  - The Vault challenge source code contains the flag, but you still need to figure out the correct interaction flow to leak it.

Now, let's get into the solutions.

## Challenge 1: Reverse Engineering

First, you need to obtain the firmware. Connect an ST-Link to the holes left on the badge for debugging. From `STM32F103CBTX_FLASH.ld` in the repository, you can see that the flash size is 128 KB. Simply Googling "stm32 flash read 128k cmd" will practically give you the command directly:

`st-flash read flash_dump.bin 0x08000000 0x20000`

Some people also used STM32CubeIDE. Once you have dumped the firmware, you temporarily no longer need the ST-Link.

This challenge was originally designed so that the intended solving direction would become clear as more code was released. However, because the other challenge directly contains the flag in its source code, I changed this challenge to provide the hint `114514` instead.

If you ask an AI to reverse engineer the firmware, or simply run `strings` on the dumped firmware, you will definitely find a lot of test descriptions related to ReverseApp. They mention enabling a **microphone** and having the badge receive a specific song. After the badge's microphone receives and processes the song, you are supposedly able to obtain the flag.

If you actually follow the text descriptions and reverse engineering results, reconstruct the program logic, and input the specified song, you will find that you cannot recover anything meaningful. This was intentional.

What this part tests is not just reverse engineering ability, but whether the player has good enough judgment. The firmware uses a large amount of text to guide you toward analyzing audio with a microphone, but players have the actual physical badge in their hands. The hardware is not new, previous firmware source code is available on GitHub, and information about previous events can also be found online.

Putting all of this information together reveals one important fact: **the badge does not have a microphone at all**.

Therefore, all of this is a bait-and-switch trap. It was also specifically designed as a trap for AI: AI can be extremely willing to trust the context it is given. Once that context is poisoned, it can easily continue in the wrong direction without sufficiently validating its assumptions from multiple sources.

The video link is a Rickroll. If you have the stage1 source code, you will find an app called `never::Gonna`. If you only have the flash dump, you can also use the hint `114514` to locate this app.

Without the hint, you could probably compile a version from the stage0 source and compare it against the dump to see what was added, although I'm not sure whether that would be obvious enough.

By reverse engineering or reading the source code, you can learn that applying the relevant operation to `114514` produces the string `FLAG`, while the payload consists of 12 bytes in the firmware XORed with the UID.

The UID is a unique identifier written into the STM32 chip during manufacturing, and every MCU has a different one.

To read the badge's UID from a computer, you first need to know its memory location, which varies between different chips. From the GitHub repository, you can determine that the MCU is an `STM32F103CBT6`. A quick Google search tells you that its UID is located at `0x1FFFF7E8`.

You can then read it with ST-Link:

`st-flash read uid.bin 0x1FFFF7E8 12`

XORing it with the payload gives the flag:

`FLAG{54Y_600cl8Y3}`

[source code](https://github.com/john0312/hitcon-pcb-badge/blob/y26-challenge-disclose/fw/Core/Hitcon/App/NeverGonna.cc)

## Challenge 2: Vault App

For this challenge, there was an interactive base station at the venue. Attendees' badges acted as clients and interacted with the base station, which acted as the server.

Both sides used the same firmware, which contains both the client and server implementations. Their roles are determined by configuration, which means you can also analyze the server logic while reverse engineering the attendee badge.

However, the flag stored on attendee badges is fake. You have to obtain the real one from the base station.

This challenge was designed as a pwn challenge, but I did not want everyone to have to reflash firmware and write their own payloads. If someone corrupted the base station's memory, I would also have to manually reboot it. Therefore, simply leaking the flag from the base station was enough to solve the challenge.

Players start with 100 dollars and there are three locked objects with corresponding keys. The keys for #0 and #1 each cost 30 dollars, while the key for #2 costs 999 dollars. The real flag is inside #2.

There is no integer underflow vulnerability by design.

This app manages its own memory pool. For simplicity, every object in the pool occupies the same amount of space. Locked objects containing flags, purchased keys, unlocked objects, and uploaded names are all stored in this pool.

Wait, **uploaded names**! That sounds like a buffer overflow, right?

Unfortunately, there is no such vulnerability either.

Initially, the memory pool contains `locked#0`, `locked#1`, and `locked#2`, in that order. Players can perform the following operations on items in their inventory: "Use", "Discard", and "Pin". Pinned items appear in the main menu for quick access.

Can you see a potential problem here?

If an object is pinned and then deleted, but its entry in the pinned list is not removed, you get a use-after-free!

When a key is used, it writes to memory and sets the final byte, `key.used`, to `true`. Because all objects in the pool have the same size, this location can conveniently overwrite the null byte at the end of a name.

At this point, we can start thinking about the attack.

The initial pool layout is:

```
pool[0] = locked#0
pool[1] = locked#1
pool[2] = locked#2
```

Therefore, the goal is to free `pool[1]` and then allocate the key and name into that location. If we can overwrite the null byte at the end of the name, we can read past it into `pool[2]`.

- To place the key and name in `pool[1]`, first buy and use `key#1`, causing `locked#1` to be freed and leaving `pool[1]` available.
- Buy `key#0`, causing it to occupy `pool[1]`, then pin and discard it.
- Next, upload a name that fills `pool[1]`, leaving only the final null byte. At this point, the pointer to the pinned key points to the contents of the name.
- Use the pinned `key#0` to overwrite the null byte with `true`.
- Print the name. It starts at `pool[1]` and continues into `locked#2` in `pool[2]`, leaking the flag.

At this point, printing the string starting from `pool[1]` no longer stops at the end of the name because its null byte has been overwritten. The output continues into `locked#2` in `pool[2]`, revealing the real flag:

`FLAG{H4CK_M30W^._.^}`

The complete design and exploit flow can be found in this [document](https://github.com/john0312/hitcon-pcb-badge/blob/y26-challenge-disclose/fw/Core/Hitcon/App/VaultApp_design.md) and [source code](https://github.com/john0312/hitcon-pcb-badge/blob/y26-challenge-disclose/fw/Core/Hitcon/App/VaultApp.cc) on GitHub.

## Thoughts on Designing the Challenges

Anyone doing security research these days probably knows that we're now in the slot machine era. Throw a challenge at an AI and pull the lever enough times, and eventually it will produce something. If it doesn't work, just tell the AI to pull again. CTF competitions can start to feel like a competition over who has more tokens.

If the only goal was to design challenges for AI to repeatedly pull until it gets the answer, that wouldn't be very interesting. So I deliberately inserted a large amount of misleading text specifically for AI. Without human intervention, it would get stuck there and have difficulty finding its way out.

AI is very good at reverse engineering, but when it comes to **choosing the right direction**, at least for now, AI still does not seem able to surpass humans. Therefore, the reverse engineering challenge is more about interpreting context: how to obtain the firmware, what hardware is actually present on the badge, which function should be analyzed, how to obtain the UID, what MCU model is being used, and so on. It is about the process of defining and validating the actual problem.

This is also what makes the challenge different from ordinary reverse engineering challenges and something specific to this badge. If you only show the firmware to an AI and never read the UID from the actual hardware, you cannot solve it.

I designed Vault after deciding that I wanted to use UAF and type confusion. The initial design was not quite right: the pinned entry itself could also be freed, resulting in a double-free vulnerability. However, AI is also very convenient for reviewing challenges, and it caught that issue quickly, allowing me to fix it.

I eventually tested both challenges with Claude, and only considered them ready after a one-shot prompt failed to solve them 😜

In the end, two attendees solved Vault 🎉

But nobody solved the reverse engineering challenge 😭 Someone was only one step away but failed to read the UID, which was really unfortunate. They were so close to solving the challenge.

Or maybe everyone was afraid that understanding the hint would reveal their true identity, so they didn't dare solve it? (sad

![hint](../hitcon-badge/hint.jpg#center)

