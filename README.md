# 🃏 Kaker Laken PokerThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



เกมโกหกสุดมันส์ที่ต้องใช้ทั้งไหวพริบและหน้านิ่ง! เล่นกับเพื่อนๆ ผ่าน LAN network## Getting Started



## วิธีเล่นFirst, run the development server:



1. **การแจกไพ่**: ผู้เล่นทุกคนจะได้รับการแจกไพ่จนหมดสำรับ บนไพ่จะเป็นรูปสัตว์ 4 ชนิด:```bash

   - 🪰 แมลงวันnpm run dev

   - 🪳 แมลงสาบ  # or

   - 🦂 แมงป่องyarn dev

   - 🐀 หนู# or

pnpm dev

2. **การส่งไพ่**: เลือกผู้เล่นหนึ่งคน ส่งไพ่หนึ่งใบให้ใครก็ได้ พร้อมบอกว่าไพ่ใบนี้คือสัตว์อะไร (อาจจริงหรือโกหกก็ได้)# or

bun dev

3. **การตัดสิน**: คนที่ได้รับไพ่มี 3 ตัวเลือก:```

   - **ทายโกหก**: ถ้าทายถูก คนส่งเก็บไพ่ | ถ้าทายผิด คุณเก็บไพ่

   - **ทายจริง**: ถ้าทายถูก คุณเก็บไพ่ | ถ้าทายผิด คนส่งเก็บไพ่Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

   - **ส่งต่อ**: ดูไพ่แล้วส่งต่อให้คนอื่น (อาจเปลี่ยนคำบอกหรือไม่ก็ได้)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

4. **เงื่อนไขแพ้**:

   - มีไพ่สัตว์ชนิดเดียวกันครบ 4 ใบThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

   - ไพ่ในมือหมดก่อนคนอื่น

## Learn More

## การติดตั้งและรัน

To learn more about Next.js, take a look at the following resources:

### ติดตั้ง Dependencies

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

```bash- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

npm install

```You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



### รันเซิร์ฟเวอร์## Deploy on Vercel



```bashThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

npm run dev

```Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Server จะรันที่ `http://0.0.0.0:3000` และสามารถเข้าถึงได้จาก IP address ของเครื่องใน LAN

### วิธีหา IP Address ของคุณ

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

หา IPv4 Address ในส่วน Wi-Fi หรือ Ethernet

### วิธีให้เพื่อนเข้าร่วม

1. Host สร้างห้องและแชร์รหัสห้อง
2. เพื่อนๆ เปิดบราวเซอร์ไปที่ `http://<IP_ADDRESS_ของ_HOST>:3000`
3. กรอกรหัสห้องเพื่อเข้าร่วม
4. เมื่อครบคนแล้ว Host กดเริ่มเกม

## คุณสมบัติ

- ✅ Real-time gameplay ด้วย Socket.IO
- ✅ เล่นได้หลายคนผ่าน LAN
- ✅ UI สวยงาม responsive
- ✅ ไม่ต้องใช้ Database
- ✅ ระบบการทายและส่งไพ่ที่สมบูรณ์
- ✅ ตรวจสอบเงื่อนไขชนะ/แพ้อัตโนมัติ

## เทคโนโลジีที่ใช้

- Next.js 16
- Socket.IO สำหรับ real-time communication
- TypeScript
- React Hooks
- CSS Modules

---

สนุกกับการเล่น! 🎮
