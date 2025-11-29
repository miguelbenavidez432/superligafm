<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles
        $admin = Role::create(['name' => 'Admin']);
        $organizador = Role::create(['name' => 'Organizador']);
        $manager = Role::create(['name' => 'Manager']);
        $visitante = Role::create(['name' => 'Visitante']);
        $writer = Role::create(['name' => 'Escritor']);
        $bet = Role::create(['name' => 'CreadorApuestas']);

        // Crear permisos (ejemplos)
        Permission::create(['name' => 'edit players']);
        Permission::create(['name' => 'edit team']);
        Permission::create(['name' => 'view rules']);
        Permission::create(['name' => 'confirm rescission']);
        Permission::create(['name' => 'confirm auctions']);
        Permission::create(['name' => 'delete players']);
        Permission::create(['name' => 'manage teams']);
        Permission::create(['name' => 'view statistics']);
        Permission::create(['name' => 'view standings']);
        Permission::create(['name' => 'create bets']);
        Permission::create(['name' => 'create posts']);
        Permission::create(['name' => 'edit rules']);

        // Asignar permisos a roles
        $admin->givePermissionTo(Permission::all());
        $organizador->givePermissionTo(['edit players', 'manage teams', 'view statistics']);
        $manager->givePermissionTo(['view statistics']);
        $visitante->givePermissionTo(['view rules']);
        $writer->givePermissionTo(['create posts', 'edit rules']);
        $bet->givePermissionTo(['create bets']);
    }
}
