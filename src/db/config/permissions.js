const defaultPermissions = [
    { name: 'create_place', description: 'Can create a place', parent: 'place' },
    { name: 'update_place', description: 'Can update a place', parent: 'place' },
    {
        name: 'delete_place', description: 'Can delete a place',
        parent: 'place'
    },
    {
        name: 'view_users',
        description: 'Can view users', parent: 'place',
    },
    { name: 'create_user', description: 'Can create a user', parent: 'place' },
    { name: 'update_user', description: 'Can update a user', parent: 'place' },
    { name: 'delete_user', description: 'Can delete a user', parent: 'place' }
];

module.exports= defaultPermissions;
