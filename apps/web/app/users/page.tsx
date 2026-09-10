'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole } from '@/lib/api/users';
import { User } from '@/lib/api/types';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User['role'] }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="mt-1 text-sm text-muted">ADMIN-only role management.</p>
      </div>
      <div className="overflow-x-auto rounded border border-line bg-white p-4">
        {users.isLoading ? <p className="text-sm text-muted">Loading users...</p> : null}
        {users.error ? <p className="text-sm text-danger">{users.error.message}</p> : null}
        {mutation.error ? <p className="mb-3 text-sm text-danger">{mutation.error.message}</p> : null}
        {users.data?.length === 0 ? <p className="text-sm text-muted">No users found.</p> : null}
        {users.data?.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Created</th></tr>
            </thead>
            <tbody>
              {users.data.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="py-3">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select className="rounded border border-line px-2 py-1 text-sm" value={user.role} onChange={(event) => mutation.mutate({ id: user.id, role: event.target.value as User['role'] })}>
                      {['ADMIN', 'RISK_MANAGER', 'VIEWER'].map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
