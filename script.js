const cardConfig = {
  // Supported languages: 'hr' and 'en'.
  language: 'hr',
  birthdayNumber: null,
  recipientName: 'Marina',
  senderName: 'Petra, Antonia & Toma',
  wishMessage: null,

  // Gift options:
  // - type: "voucher" shows the built-in voucher below.
  // - type: "image" shows an image from giftUrl.
  // - type: "pdf" links to a PDF from giftUrl.
  gift: {
    type: 'voucher',
    title: 'Radionica preuređenja namještaja',
    description: 'Da ona ružna kužina zasja u svojm punom potencijalu!',
    buttonText: 'Preuzmi poklon',
    giftUrl:
      'https://1drv.ms/b/c/9b950dbe2d2285ee/IQBTRkxmwGqjTpXxzbS39ffMATqUJreL6Gk6hJ3DfWF29us?e=g2qoug',
  },
};

const translations = {
  en: {
    pageTitle: 'Birthday Wish Card',
    cardLabel: 'Digital birthday card',
    heading: (name) => `Happy Birthday, ${name}!`,
    signatureLabel: 'With love',
    openGift: 'Open me',
    openedGift: 'Surprise!',
  },
  hr: {
    pageTitle: 'Rođendanska čestitka',
    cardLabel: 'Digitalna rođendanska čestitka',
    heading: (name) => `Sretan rođendan, ${name}!`,
    signatureLabel: 'S ljubavlju',
    openGift: 'Otvori me',
    openedGift: 'Iznenađenje!',
  },
};

const labels = translations[cardConfig.language] || translations.en;

const birthdayCard = document.querySelector('#birthdayCard');
const birthdayNumber = document.querySelector('#birthdayNumber');
const birthdayHeading = document.querySelector('#birthdayHeading');
const signatureLabel = document.querySelector('#signatureLabel');
const senderName = document.querySelector('#senderName');
const wishMessage = document.querySelector('#wishMessage');
const giftButton = document.querySelector('#giftButton');
const giftLabel = document.querySelector('#giftLabel');
const giftOverlay = document.querySelector('#giftOverlay');
const giftReveal = document.querySelector('#giftReveal');
const giftCloseButton = document.querySelector('#giftCloseButton');
const giftContent = document.querySelector('#giftContent');
const confettiCanvas = document.querySelector('#confettiCanvas');
const context = confettiCanvas.getContext('2d');

let confettiPieces = [];
let confettiAnimation = null;
let opened = false;

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function setElementVisibility(element, visible) {
  if (!element) {
    return;
  }

  element.hidden = !visible;
  if (visible) {
    element.style.removeProperty('display');
  } else {
    element.style.display = 'none';
  }
}

function fillCardText() {
  document.documentElement.lang = cardConfig.language;
  document.title = labels.pageTitle;
  birthdayCard.setAttribute('aria-label', labels.cardLabel);

  const showBirthdayNumber = hasValue(cardConfig.birthdayNumber);
  setElementVisibility(birthdayNumber, showBirthdayNumber);
  if (showBirthdayNumber) {
    birthdayNumber.textContent = cardConfig.birthdayNumber;
  }

  const showHeading = hasValue(cardConfig.recipientName);
  setElementVisibility(birthdayHeading, showHeading);
  if (showHeading) {
    birthdayHeading.textContent = labels.heading(cardConfig.recipientName);
  }

  const showWishMessage = hasValue(cardConfig.wishMessage);
  setElementVisibility(wishMessage, showWishMessage);
  if (showWishMessage) {
    wishMessage.textContent = cardConfig.wishMessage;
  }

  const showSignature = hasValue(cardConfig.senderName);
  setElementVisibility(senderName.closest('.signature'), showSignature);
  if (showSignature) {
    signatureLabel.textContent = labels.signatureLabel;
    senderName.textContent = cardConfig.senderName;
  }

  giftLabel.textContent = labels.openGift;
}

function buildGift() {
  const gift = cardConfig.gift || {};
  const textBlock = document.createElement('div');

  if (hasValue(gift.title)) {
    const title = document.createElement('h2');
    title.textContent = gift.title;
    textBlock.append(title);
  }

  if (hasValue(gift.description)) {
    const description = document.createElement('p');
    description.textContent = gift.description;
    textBlock.append(description);
  }

  giftContent.replaceChildren();
  if (textBlock.childElementCount > 0) {
    giftContent.append(textBlock);
  }

  if (gift.type === 'image' && hasValue(gift.giftUrl)) {
    const image = document.createElement('img');
    image.src = gift.giftUrl;
    image.alt = hasValue(gift.title) ? gift.title : labels.openedGift;
    giftContent.append(image);
    return;
  }

  const showLink =
    gift.type === 'pdf' || hasValue(gift.buttonText) || hasValue(gift.giftUrl);
  if (!showLink) {
    return;
  }

  const link = document.createElement('a');
  link.href = hasValue(gift.giftUrl) ? gift.giftUrl : '#';
  link.textContent = hasValue(gift.buttonText)
    ? gift.buttonText
    : labels.openedGift;

  if (hasValue(gift.giftUrl)) {
    link.target = '_blank';
    link.rel = 'noreferrer';
  } else {
    link.addEventListener('click', (event) => event.preventDefault());
  }

  giftContent.append(link);
}

function openGift() {
  if (opened) {
    showGiftModal();
    return;
  }

  opened = true;
  giftButton.classList.add('opened');
  giftButton.setAttribute('aria-expanded', 'true');
  giftLabel.textContent = labels.openedGift;
  buildGift();
  showGiftModal();
  createSparkles();
  launchConfetti();
}

function showGiftModal() {
  setElementVisibility(giftOverlay, true);
  document.body.classList.add('modal-open');
  giftButton.setAttribute('aria-expanded', 'true');
  giftReveal.focus();
}

function closeGiftModal() {
  setElementVisibility(giftOverlay, false);
  document.body.classList.remove('modal-open');
  giftButton.setAttribute('aria-expanded', 'false');
  giftButton.focus();
}

function onGiftOverlayClick(event) {
  if (event.target === giftOverlay) {
    closeGiftModal();
  }
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape' && giftOverlay && !giftOverlay.hidden) {
    closeGiftModal();
  }
}

function createSparkles() {
  const positions = [
    [-52, -70],
    [58, -88],
    [-98, -10],
    [104, -22],
    [-28, 16],
    [34, 24],
  ];

  positions.forEach(([x, y], index) => {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = '50%';
    sparkle.style.top = '44%';
    sparkle.style.setProperty('--spark-x', `${x}px`);
    sparkle.style.setProperty('--spark-y', `${y}px`);
    sparkle.style.animationDelay = `${index * 0.06}s`;
    giftButton.append(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
  });
}

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  confettiCanvas.width = Math.floor(window.innerWidth * scale);
  confettiCanvas.height = Math.floor(window.innerHeight * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
}

function launchConfetti() {
  const colors = ['#ff5d8f', '#ffd166', '#2ec4b6', '#76c7ff', '#8bd450'];
  confettiPieces = Array.from({ length: 120 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
    y: window.innerHeight * 0.42 + (Math.random() - 0.5) * 120,
    size: Math.random() * 8 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
    rotationSpeed: (Math.random() - 0.5) * 0.24,
    velocityX: (Math.random() - 0.5) * 8,
    velocityY: Math.random() * -9 - 4,
    gravity: Math.random() * 0.22 + 0.18,
    life: 0,
    maxLife: Math.random() * 55 + 105,
  }));

  if (!confettiAnimation) {
    animateConfetti();
  }
}

function animateConfetti() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPieces = confettiPieces.filter((piece) => {
    piece.life += 1;
    piece.x += piece.velocityX;
    piece.y += piece.velocityY;
    piece.velocityY += piece.gravity;
    piece.rotation += piece.rotationSpeed;

    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(piece.rotation);
    context.fillStyle = piece.color;
    context.fillRect(
      -piece.size / 2,
      -piece.size / 2,
      piece.size,
      piece.size * 0.62,
    );
    context.restore();

    return piece.life < piece.maxLife && piece.y < window.innerHeight + 40;
  });

  if (confettiPieces.length > 0) {
    confettiAnimation = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimation = null;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

fillCardText();
resizeCanvas();

const hasGift = cardConfig.gift !== null;
setElementVisibility(giftButton.closest('.gift-stage'), hasGift);
if (!hasGift) {
  setElementVisibility(giftOverlay, false);
} else {
  setElementVisibility(giftOverlay, false);
  giftButton.addEventListener('click', openGift);
  giftCloseButton.addEventListener('click', closeGiftModal);
  giftOverlay.addEventListener('click', onGiftOverlayClick);
  document.addEventListener('keydown', onDocumentKeydown);
}

window.addEventListener('resize', resizeCanvas);
