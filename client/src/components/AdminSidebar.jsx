import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderOpen, Tag, Package, Users } from 'lucide-react';

function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Sản phẩm', icon: ShoppingBag },
    { path: '/admin/categories', label: 'Danh mục', icon: FolderOpen },
    { path: '/admin/attributes', label: 'Thuộc tính', icon: Tag },
    { path: '/admin/orders', label: 'Đơn hàng', icon: Package },
    { path: '/admin/users', label: 'Người dùng', icon: Users }
  ];

  return (
    <div className="w-full md:w-64">
      <div className="bg-white rounded-lg shadow">
        <div className="bg-primary-light px-4 py-3 rounded-t-lg">
          <h5 className="text-gray-800 font-semibold">Quản trị</h5>
        </div>
        <div className="divide-y divide-gray-200">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;

