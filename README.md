# Colossal Bip Max

Animated Colossal Titan watch face for the Amazfit Bip Max.

## 1. Download and install dependencies

```bash
git clone https://github.com/pedrosfaria2/colossal-bip-max.git
cd colossal-bip-max
npm install
```

## 2. Sign in to Zepp

```bash
node scripts/zeus.cjs login
```

Follow the terminal prompts using your Zepp account.

## 3. Compile and generate the installation QR code

```bash
node scripts/zeus.cjs preview -t "Amazfit Bip Max"
```
