# Simple Bot for import static stickers from Telegram to Whatsapp

## How to run?

### Setup env

```sh
cp .env.sample .env
```

Edit `.env`

### Run

```sh
docker build -t t2w_sticker .
docker run t2w_sticker
```
and login via qr code Whatsapp
