import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
type Role = 'CLIENTE' | 'ADMIN';
interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}
interface User {
  nombre: string;
  role: Role;
}
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  cartCount = signal(2);
  currentUser = signal<User | null>(null);
  publicMenu = signal<MenuItem[]>([
    { label: 'Inicio', path: '/', icon: 'home' },
    { label: 'Cursos', path: '/cursos', icon: 'school' },
    { label: 'Profesionales', path: '/profesionales', icon: 'person_search' },
    { label: 'Mi Agenda', path: '/mis-citas', icon: 'calendar_month', roles: ['CLIENTE', 'ADMIN'] },
  ]);



  adminMaintenanceMenu = signal<MenuItem[]>([
    { label: 'Usuario', path: '/admin/usuarios', icon: 'group' },
    { label: 'Profesionales', path: '/admin/profesionales', icon: 'school' },
    { label: 'Categorías', path: '/admin/categorias', icon: 'category' },
    { label: 'Especialidades', path: '/admin/especialidades', icon: 'workspace_premium' },
    { label: 'Cursos', path: '/admin/servicios', icon: 'menu_book' },
  ]);


adminManagementMenu = signal<MenuItem[]>([
    { label: 'Citas', path: '/admin/citas', icon: 'event' },
    { label: 'Reseñas', path: '/admin/resenas', icon: 'reviews' },

  ]);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  canShowItem(item: MenuItem): boolean {
    if (!item.roles) return true;
    const user = this.currentUser();
    return !!user && item.roles.includes(user.role);
  }
  loginAsClient(): void {
    this.currentUser.set({ nombre: 'Cliente Demo', role: 'CLIENTE' });
  }
  loginAsAdmin(): void {
    this.currentUser.set({ nombre: 'Admin Demo', role: 'ADMIN' });
  }
  logout(): void {
    this.currentUser.set(null);
  }
}
