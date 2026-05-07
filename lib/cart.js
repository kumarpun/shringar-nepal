// Client-side cart utilities (localStorage)

function getCartKey() {
  if (typeof window === "undefined") return "shringar-cart-guest";
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed?.id) return `shringar-cart-${parsed.id}`;
    }
  } catch {}
  return "shringar-cart-guest";
}

export function getCart() {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(getCartKey());
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === product.id);
  const stock = Number(product.stock) || 0;

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, stock);
    existing.stock = stock;
  } else {
    let imageUrl = null;
    if (product.images) {
      try {
        const parsed = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
      } catch {}
    }

    cart.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl,
      quantity: Math.min(quantity, stock),
      stock,
    });
  }

  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.productId === productId);
  if (item) {
    item.quantity = Math.max(1, Math.min(quantity, item.stock || Infinity));
    saveCart(cart);
    window.dispatchEvent(new Event("cart-updated"));
  }
}

export function clearCart() {
  localStorage.removeItem(getCartKey());
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount() {
  return getCart().length;
}

export function setCheckoutItems(items) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("shringar-checkout-items", JSON.stringify(items));
}

export function getCheckoutItems() {
  if (typeof window === "undefined") return [];
  const items = sessionStorage.getItem("shringar-checkout-items");
  return items ? JSON.parse(items) : [];
}

export function clearCheckoutItems() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("shringar-checkout-items");
}

export function removeItemsFromCart(itemsToRemove) {
  const cart = getCart();
  const updated = cart.filter(
    (item) => !itemsToRemove.some((r) => r.productId === item.productId)
  );
  saveCart(updated);
  window.dispatchEvent(new Event("cart-updated"));
}

export function mergeGuestCart() {
  if (typeof window === "undefined") return;
  const guestKey = "shringar-cart-guest";
  const guestCart = localStorage.getItem(guestKey);
  if (!guestCart) return;

  let guestItems;
  try { guestItems = JSON.parse(guestCart); } catch { return; }
  if (!Array.isArray(guestItems) || guestItems.length === 0) return;

  const userCart = getCart();

  for (const guestItem of guestItems) {
    const existing = userCart.find((item) => item.productId === guestItem.productId);
    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + guestItem.quantity,
        existing.stock || Infinity
      );
    } else {
      userCart.push(guestItem);
    }
  }

  saveCart(userCart);
  localStorage.removeItem(guestKey);
  window.dispatchEvent(new Event("cart-updated"));
}
