import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Menu, X, Search as SearchIcon, ShoppingCart, Package, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link className="text-primary font-bold text-xl hover:text-primary-hover transition-colors" to="/">
          Le Parfum
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center max-w-xs">
            <Link className="text-foreground hover:text-primary transition-colors font-medium" to="/">
              Trang chủ
            </Link>
            <Link className="text-foreground hover:text-primary transition-colors font-medium" to="/products">
              Sản phẩm
            </Link>
          </div>

          {/* Search Form */}
          <form className="hidden md:flex items-center space-x-2 flex-1 max-w-md" onSubmit={handleSearch}>
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <SearchIcon size={18} />
              Tìm
            </Button>
          </form>

          {/* Desktop Auth Menu */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link to="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart size={20} />
                    <span className="ml-1">Giỏ hàng</span>
                    {cartItemCount > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="ghost" size="sm">
                    <Package size={20} />
                    <span className="ml-1">Đơn hàng</span>
                  </Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Quản trị
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hidden lg:flex">
                    <User size={20} />
                    <span className="ml-1">{user?.username || 'Tài khoản'}</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <User size={20} />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white hidden lg:flex" 
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span className="ml-1">Đăng xuất</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white lg:hidden" 
                  onClick={handleLogout}
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn size={20} />
                    <span className="ml-1">Đăng nhập</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    <UserPlus size={18} />
                    <span className="ml-1">Đăng ký</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link className="text-foreground hover:text-primary transition-colors font-medium" to="/" onClick={() => setMobileMenuOpen(false)}>
                Trang chủ
              </Link>
              <Link className="text-foreground hover:text-primary transition-colors font-medium" to="/products" onClick={() => setMobileMenuOpen(false)}>
                Sản phẩm
              </Link>
              <form className="flex items-center space-x-2" onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <SearchIcon size={18} />
                </Button>
              </form>
              {isAuthenticated ? (
                <>
                  <Link className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium" to="/cart" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingCart size={20} />
                    Giỏ hàng
                    {cartItemCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Link>
                  <Link className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium" to="/orders" onClick={() => setMobileMenuOpen(false)}>
                    <Package size={20} />
                    Đơn hàng
                  </Link>
                  {user?.role === 'admin' && (
                    <Link className="text-foreground hover:text-primary transition-colors font-medium" to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      Quản trị
                    </Link>
                  )}
                  <Link className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium" to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <User size={20} />
                    {user?.username || 'Tài khoản'}
                  </Link>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white w-fit" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut size={16} />
                    <span className="ml-1">Đăng xuất</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium" to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn size={20} />
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-fit">
                      <UserPlus size={18} />
                      <span className="ml-1">Đăng ký</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

