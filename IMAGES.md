# 📸 HSTC Bilder-Verwaltung

## 📁 Empfohlene Ordnerstruktur

```
public/images/
├── HSTC-Logo.webp                    # Hauptlogo der Organisation
├── hstc_discord_qr.webp             # Discord QR Code
├── flags/                           # Flaggen der D/A/CH-Region
│   ├── switzerland-flag-square-medium.webp
│   ├── germany-flag-square-medium.webp
│   └── austria-flag-square-medium.webp
├── backgrounds/                     # Hintergrundbilder
│   ├── Pyro.webp                   # Haupthintergrund
│   ├── Starlancer.webp            # Glass Section Background
│   ├── Jumpgate.webp              # Karten-Hintergrund
│   └── Explosion.webp             # Karten-Hintergrund
└── ships/                          # Schiffsbilder
    ├── Ship.webp                  # Allgemeines Schiffsbild
    └── Hornet.webp               # Discord Section Background
```

## 🎯 Verwendung im Code

Alle Bildpfade sind bereits konfiguriert:

### **Logos & Icons**
```html
<!-- Hauptlogo -->
<img src="./public/images/HSTC-Logo.webp" alt="HSTC Logo" />

<!-- Discord QR Code -->
<img src="./public/images/hstc_discord_qr.webp" alt="Discord QR Code" />
```

### **Flaggen**
```html
<img src="./public/images/flags/switzerland-flag-square-medium.webp" alt="CH" />
<img src="./public/images/flags/germany-flag-square-medium.webp" alt="DE" />
<img src="./public/images/flags/austria-flag-square-medium.webp" alt="AT" />
```

### **Hintergrundbilder (CSS)**
```css
/* Haupthintergrund */
.space-bg {
  background: url('./public/images/backgrounds/Pyro.webp') center/cover no-repeat;
}

/* Glass Section */
.glass-section {
  background: url('./public/images/backgrounds/Starlancer.webp') center/cover no-repeat fixed;
}

/* Karten-Hintergründe */
.glass-card-background:nth-of-type(1) {
  background: url('./public/images/ships/Ship.webp') center/cover no-repeat;
}

.glass-card-background:nth-of-type(2) {
  background: url('./public/images/backgrounds/Jumpgate.webp') center/cover no-repeat;
}

.glass-card-background:nth-of-type(3) {
  background: url('./public/images/backgrounds/Explosion.webp') center/cover no-repeat;
}
```

## 📋 Checkliste zum Hinzufügen der Bilder

- [ ] **HSTC-Logo.webp** → `public/images/`
- [ ] **hstc_discord_qr.webp** → `public/images/`
- [ ] **switzerland-flag-square-medium.webp** → `public/images/flags/`
- [ ] **germany-flag-square-medium.webp** → `public/images/flags/`
- [ ] **austria-flag-square-medium.webp** → `public/images/flags/`
- [ ] **Pyro.webp** → `public/images/backgrounds/`
- [ ] **Starlancer.webp** → `public/images/backgrounds/`
- [ ] **Jumpgate.webp** → `public/images/backgrounds/`
- [ ] **Explosion.webp** → `public/images/backgrounds/`
- [ ] **Ship.webp** → `public/images/ships/`
- [ ] **Hornet.webp** → `public/images/ships/`

## 🔧 Optimierung

### **Empfohlene Bildformate:**
- ✅ **WebP**: Beste Kompression und Qualität
- ✅ **PNG**: Für Logos mit Transparenz
- ✅ **JPG**: Fallback für ältere Browser

### **Empfohlene Bildgrößen:**
- **Logos**: 200x180px (oder höher für Retina)
- **Flaggen**: 25x25px (für UI-Elemente)
- **Hintergründe**: 1920x1080px oder höher
- **QR-Code**: 200x200px

### **Git LFS (Optional)**
Für große Bilddateien können Sie Git LFS verwenden:

```bash
# Git LFS installieren
git lfs install

# Bildformate tracken
git lfs track "*.webp"
git lfs track "*.jpg"
git lfs track "*.png"

# .gitattributes committen
git add .gitattributes
git commit -m "Add Git LFS tracking for images"
```

## 🚀 Nach dem Hinzufügen

1. **Bilder in die entsprechenden Ordner kopieren**
2. **Website im Browser öffnen** (`index.html`)
3. **Überprüfen dass alle Bilder laden**
4. **Git committen:**
   ```bash
   git add public/images/
   git commit -m "Add HSTC images and assets"
   git push
   ```

## 🎯 Amplify Storage Integration

Die Bilder können auch über Amplify Storage verwaltet werden:

```javascript
// Upload to Amplify Storage
await uploadData({
  key: 'public/images/HSTC-Logo.webp',
  data: file,
  options: {
    contentType: 'image/webp'
  }
});

// Get URL
const url = await getUrl({
  key: 'public/images/HSTC-Logo.webp'
});
```

**Vorteil**: Automatische CDN-Verteilung und Skalierung
**Nachteil**: Erfordert Backend-Deployment

---

**Ready for your images! 🖼️ o7**