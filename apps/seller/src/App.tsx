import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>FishMarket Seller Portal</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export { App };
