import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { DataForm } from "./pages/Form"

const Router = () => {
  return (
    <Routes>
      <Route path={'/'} element={<Home />} />
      <Route path={'/new'} element={<DataForm />} />
    </Routes>
  );
};

export default Router;
