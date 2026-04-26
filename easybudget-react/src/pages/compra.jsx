import { useState } from 'react';
import Layout from '../components/Layout';
import '../styles/compra.css';

function Compra() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const [shoppingLists, setShoppingLists] = useState(JSON.parse(localStorage.getItem('shoppingLists')) || []);

  const currentListId = `${currentUser.id}-${date}`;

  const currentList = shoppingLists.find((list) => list.id === currentListId) || {
    id: currentListId,
    userId: currentUser.id,
    date,
    products: [],
    movementId: null,
  };

  const total = currentList.products.reduce((sum, product) => sum + Number(product.price), 0);

  function saveShoppingLists(updatedLists) {
    setShoppingLists(updatedLists);
    localStorage.setItem('shoppingLists', JSON.stringify(updatedLists));
  }

  function syncMovement(updatedList) {
    const movements = JSON.parse(localStorage.getItem('movements')) || [];

    function formatDateSpanish(date) {
      const d = new Date(date);

      const day = d.getDate();
      const month = d.toLocaleString('es-ES', { month: 'long' });

      return `Compra del ${day} de ${month}`;
    }

    const movementConcept = formatDateSpanish(updatedList.date);
    if (updatedList.products.length === 0) {
      const filteredMovements = movements.filter((movement) => movement.id !== updatedList.movementId);

      localStorage.setItem('movements', JSON.stringify(filteredMovements));
      return null;
    }

    if (updatedList.movementId) {
      const updatedMovements = movements.map((movement) => {
        if (movement.id === updatedList.movementId) {
          return {
            ...movement,
            concept: movementConcept,
            amount: totalFromProducts(updatedList.products),
            date: updatedList.date,
          };
        }

        return movement;
      });

      localStorage.setItem('movements', JSON.stringify(updatedMovements));
      return updatedList.movementId;
    }

    const newMovement = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      type: 'expense',
      concept: movementConcept,
      category: 'Compra',
      amount: totalFromProducts(updatedList.products),
      date: updatedList.date,
      isShoppingMovement: true,
    };

    localStorage.setItem('movements', JSON.stringify([...movements, newMovement]));
    return newMovement.id;
  }

  function totalFromProducts(products) {
    return products.reduce((sum, product) => sum + Number(product.price), 0);
  }

  function updateList(updatedProducts) {
    const updatedList = {
      ...currentList,
      date,
      products: updatedProducts,
    };

    const movementId = syncMovement(updatedList);

    const finalList = {
      ...updatedList,
      movementId,
    };

    const exists = shoppingLists.some((list) => list.id === currentListId);

    const updatedLists = exists
      ? shoppingLists.map((list) => (list.id === currentListId ? finalList : list))
      : [...shoppingLists, finalList];

    saveShoppingLists(updatedLists);
  }

  function handleAddProduct(e) {
    e.preventDefault();

    if (!productName.trim() || !productPrice || Number(productPrice) <= 0) {
      alert('Introduce un producto y un precio válido');
      return;
    }

    const newProduct = {
      id: crypto.randomUUID(),
      name: productName.trim(),
      price: Number(productPrice),
    };

    updateList([...currentList.products, newProduct]);

    setProductName('');
    setProductPrice('');
  }

  function handleDeleteProduct(productId) {
    const updatedProducts = currentList.products.filter((product) => product.id !== productId);

    updateList(updatedProducts);
  }

  return (
    <Layout>
      <header className="main-header">
        <div>
          <h1>Compra</h1>
          <p>Añade productos de la compra y genera automáticamente un movimiento de comida.</p>
        </div>
      </header>

      <section className="shopping-summary">
        <article className="card summary-card">
          <span>Total compra</span>
          <h3>{total.toFixed(2)} €</h3>
          <p>Se sincroniza con movimientos</p>
        </article>

        <article className="card summary-card">
          <span>Productos</span>
          <h3>{currentList.products.length}</h3>
          <p>Artículos añadidos</p>
        </article>
      </section>

      <section className="shopping-grid">
        <article className="card shopping-form-card">
          <div className="card-header">
            <div>
              <h2>Nueva compra</h2>
              <p>Selecciona el día y añade productos.</p>
            </div>
          </div>

          <form className="shopping-form" onSubmit={handleAddProduct}>
            <div className="form-group">
              <label htmlFor="date">Fecha de compra</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="productName">Producto</label>
              <input
                id="productName"
                type="text"
                placeholder="Ej. leche"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="productPrice">Precio</label>
              <input
                id="productPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">
              Añadir producto
            </button>
          </form>
        </article>

        <article className="card shopping-list-card">
          <div className="card-header">
            <div>
              <h2>Compra día {new Date(date).getDate()}</h2>
              <p>Detalle de productos añadidos.</p>
            </div>
          </div>

          {currentList.products.length === 0 ? (
            <p>No hay productos añadidos para esta fecha.</p>
          ) : (
            <div className="shopping-products">
              {currentList.products.map((product) => (
                <div className="shopping-product" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>Producto de compra</span>
                  </div>

                  <div className="shopping-product-actions">
                    <strong>{Number(product.price).toFixed(2)} €</strong>
                    <button type="button" className="btn-delete" onClick={() => handleDeleteProduct(product.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              <div className="shopping-total">
                <span>Total</span>
                <strong>{total.toFixed(2)} €</strong>
              </div>
            </div>
          )}
        </article>
      </section>
    </Layout>
  );
}

export default Compra;
