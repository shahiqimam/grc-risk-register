'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/api/users';

export default function UsersPage() {
  const users = useQuery({ queryKey: ['users'], queryFn: getUsers });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="mt-1 text-sm text-muted">ADMIN-only role management.</p>
      </div>
      <div className="rounded border border-line bg-white p-4">
        {users.isLoading ? <p className="text-sm text-muted">Loading users...</p> : null}
        {users.error ? <p className="text-sm text-danger">{users.error.message}</p> : null}
        {users.data?.length === 0 ? <p className="text-sm text-muted">No users found.</p> : null}
        {users.data?.length ? (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Created</th></tr>
            </thead>
            <tbody>
              {users.data.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="py-3">{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
