import { Menu } from '@headlessui/react'
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/auth'

export default function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-background-tertiary transition">
        {user.avatar ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
        )}
        <span className="text-sm font-medium">{user.username}</span>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 bg-background-secondary border border-gray-800 rounded-lg shadow-lg py-1">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={logout}
              className={`${
                active ? 'bg-background-tertiary' : ''
              } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300`}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  )
}
