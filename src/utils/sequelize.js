export const applyScopes = (Model, query = {}) => {
    const scopes = [];

    // Soft delete scopes
    if (query.withDeleted === 'true') {
        scopes.push('withDeleted');
    } else if (query.onlyDeleted === 'true') {
        scopes.push('onlyDeleted');
    } else {
        scopes.push('notDeleted');
    }

    // Status-based scopes
    if (query.status === 'false') {
        scopes.push('inactive');
    }

    return Model.scope(scopes);
};
