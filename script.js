  <script>
    /**********************
     * Sample product data
     **********************/
    const PRODUCTS = [
      { id:'P-001', title:'Classic VANS Old Skool', price:14500, img:'80ab53f3e741c9d9c3aea00894ea238f.jpg' },
      { id:'P-002', title:'VANS Slip-On Sneakers', price:32500, img:'d25c265c63c07a3ae081c1dc51cff9d3.jpg' },
      { id:'P-003', title:'Nike Air Max Running Shoe', price:22500, img:'a62d145c67d1388ab36a5ea44c758f27.jpg' },
      { id:'P-004', title:'Adidas Ultraboost Premium', price:28000, img:'80ab53f3e741c9d9c3aea00894ea238f.jpg' },
      { id:'P-005', title:'Casual Canvas Sneaker', price:59500, img:'00eeafdddb469ebca29aa1e1ef1e2873.jpg' },
      { id:'P-006', title:'Sports Athletic Trainer', price:16000, img:'606666744eb694f973b1375ceb4c0581.jpg' },
      { id:'P-007', title:'Casual Slip-On Loafer', price:25000, img:'a62d145c67d1388ab36a5ea44c758f27.jpg' },
      { id:'P-008', title:'Premium Basketball Shoe', price:39800, img:'80ab53f3e741c9d9c3aea00894ea238f.jpg' }
    ];

    /* render products */
    const productsGrid = document.getElementById('productsGrid');
    const cart = {}; // {id:{product,qty}}
    function formatNGN(n){ return '₦' + n.toLocaleString() }

    function renderProducts(){
      productsGrid.innerHTML = '';
      PRODUCTS.forEach(p=>{
        const el = document.createElement('article');
        el.className='card';
        el.innerHTML = `
          <img src="${p.img}" alt="${p.title}">
          <div class="meta">
            <div class="product-title">${p.title}</div>
            <div class="price">${formatNGN(p.price)}</div>
          </div>
          <p>Code: ${p.id} • Imported / Premium quality</p>
          <div class="actions">
            <button class="btn-sm btn-cart" data-id="${p.id}">Add to cart</button>
            <button class="btn-sm btn-buy" data-id="${p.id}">Buy now</button>
          </div>
        `;
        productsGrid.appendChild(el);
      });
    }
    renderProducts();

    /* add to cart behaviour */
    function updateCartCount(){
      const count = Object.values(cart).reduce((s,i)=>s+i.qty,0);
      document.getElementById('cart-count').textContent = count;
      const cartBtn = document.getElementById('open-cart-btn');
      if(count>0) {
        cartBtn.classList.remove('empty');
      } else {
        cartBtn.classList.add('empty');
      }
    }

    document.addEventListener('click', (e)=>{
      const t = e.target;
      if(t.matches('.btn-cart')) {
        const id = t.dataset.id;
        addToCart(id,1);
      }
      if(t.matches('.btn-buy')) {
        const id = t.dataset.id;
        addToCart(id,1);
        openCheckout();
      }
    });

    function addToCart(id, qty=1){
      const p = PRODUCTS.find(x=>x.id===id);
      if(!p) return;
      if(!cart[id]) cart[id] = { product:p, qty:0 };
      cart[id].qty += qty;
      updateCartCount();
      renderCart();
      showToast(`${p.title} added to cart`);
    }

    function renderCart(){
      const container = document.getElementById('cartItems');
      container.innerHTML = '';
      let total = 0;
      Object.values(cart).forEach(item=>{
        total += item.product.price * item.qty;
        const node = document.createElement('div');
        node.className = 'cart-item';
        node.innerHTML = `
          <img src="${item.product.img}">
          <div class="right">
            <div class="name">${item.product.title}</div>
            <div class="qty">Qty: ${item.qty} • ${formatNGN(item.product.price)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700">${formatNGN(item.product.price * item.qty)}</div>
            <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">
              <button data-id="${item.product.id}" class="btn-sm" style="background:#eee">-</button>
              <button data-id="${item.product.id}" class="btn-sm" style="background:#eee">+</button>
            </div>
          </div>
        `;
        container.appendChild(node);
      });
      document.getElementById('cartTotal').textContent = formatNGN(total);
    }

    // cart quantity buttons (delegate)
    document.getElementById('cartDrawer').addEventListener('click', function(e){
      const t = e.target;
      if(t.tagName === 'BUTTON' && t.dataset.id){
        const id = t.dataset.id;
        if(t.textContent.trim()==='+') addToCart(id,1);
        else if(t.textContent.trim()==='-'){
          if(cart[id]){
            cart[id].qty -= 1;
            if(cart[id].qty<=0) delete cart[id];
            updateCartCount();
            renderCart();
          }
        }
      }
    });

    /* cart open/close */
    const cartBtn = document.getElementById('open-cart-btn');
    const cartDrawer = document.getElementById('cartDrawer');

    cartBtn.addEventListener('click', ()=>{
      if(cartDrawer.style.display === 'none' || cartDrawer.style.display === '') {
        cartDrawer.style.display = 'block';
      } else {
        cartDrawer.style.display = 'none';
      }
    });

    document.getElementById('clearCart').addEventListener('click', ()=>{
      for(const k in cart) delete cart[k];
      updateCartCount();
      renderCart();
    });

    /* quick order & contact */
    document.getElementById('quickOrder').addEventListener('click', (e)=>{
      e.preventDefault();
      const code = document.getElementById('productCode').value.trim();
      const qty = parseInt(document.getElementById('productQty').value,10) || 1;
      if(!code){ alert('Enter a product code'); return; }
      const p = PRODUCTS.find(x=>x.id===code);
      if(!p){ alert('Product code not found'); return; }
      addToCart(code, qty);
      showToast('Product added to cart');
    });

    document.getElementById('contactForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      showToast('Message sent — we will contact you soon');
      e.target.reset();
    });

    /* checkout modal */
    const modal = document.getElementById('modal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const closeModalBtn = document.getElementById('closeModal');

    checkoutBtn.addEventListener('click', openCheckout);
    closeModalBtn.addEventListener('click', ()=> modal.style.display='none');

    function openCheckout(){
      // fill order summary
      const summary = document.getElementById('orderSummary');
      summary.innerHTML = '';
      let total = 0;
      Object.values(cart).forEach(item=>{
        const div = document.createElement('div');
        div.style.display='flex';
        div.style.justifyContent='space-between';
        div.style.marginBottom='6px';
        div.textContent = `${item.product.title} x${item.qty}`;
        const price = document.createElement('span');
        price.textContent = formatNGN(item.product.price * item.qty);
        div.appendChild(price);
        summary.appendChild(div);
        total += item.product.price * item.qty;
      });
      const totalLine = document.createElement('div');
      totalLine.style.fontWeight='700'; totalLine.style.marginTop='8px';
      totalLine.textContent = 'Total: ' + formatNGN(total);
      summary.appendChild(totalLine);

      modal.style.display = 'block';
    }

    document.getElementById('checkoutForm').addEventListener('submit', function(e){
      e.preventDefault();
      // gather data
      const name = document.getElementById('c-name').value;
      const email = document.getElementById('c-email').value;
      const phone = document.getElementById('c-phone').value;
      const address = document.getElementById('c-address').value;
      // For project demo: just show success
      showToast('Order placed. We will contact you via email/phone.');
      modal.style.display='none';
      // clear cart
      for(const k in cart) delete cart[k];
      updateCartCount();
      renderCart();
      document.getElementById('checkoutForm').reset();
    });

    // mobile menu toggle
    function toggleMobile(){ 
      const mm = document.getElementById('mobileMenu');
      const hambtn = document.getElementById('hambtn');
      if(mm.style.display === 'flex') {
        mm.style.display = 'none';
        hambtn.classList.remove('active');
      } else {
        mm.style.display = 'flex';
        hambtn.classList.add('active');
      }
    }
    document.getElementById('hambtn').addEventListener('click', toggleMobile);
    document.getElementById('closeMenuBtn').addEventListener('click', toggleMobile);
    
    // close menu when clicking outside
    document.getElementById('mobileMenu').addEventListener('click', (e)=>{
      if(e.target.id === 'mobileMenu') toggleMobile();
    });

    // form open quick
    document.getElementById('openForm').addEventListener('click', ()=>{
      document.getElementById('contact').scrollIntoView({behavior:'smooth'});
    });

    // small toast
    function showToast(msg){
      const t = document.createElement('div');
      t.textContent = msg;
      t.style.position='fixed';
      t.style.left='50%'; t.style.transform='translateX(-50%)';
      t.style.bottom='28px'; t.style.background='#111'; color='#fff';
      t.style.color='#fff';
      t.style.padding='10px 14px'; t.style.borderRadius='10px'; t.style.zIndex=200; t.style.opacity=0; t.style.transition='opacity .2s';
      t.style.animation='fadeInUp .3s ease-out';
      document.body.appendChild(t);
      setTimeout(()=> t.style.opacity=1,10);
      setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.remove(),300)},2000);
    }

    // render products first time
    updateCartCount();
    renderCart();

  