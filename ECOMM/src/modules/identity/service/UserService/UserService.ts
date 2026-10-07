export default class UserService {

    getUsers();
    getUser();
    deleteUser();
    updateUser();
    createUser();
    importUsers();
    updateUserStatus();
    getViews(tableKey?: string, userId?: any);
    saveView(data: any);
    getView(id: any);
    deleteView(id: any);
    setDefaultView(id: any, tableKey?: string, userId?: any);
}