package com.example.online_shopping.Enum;

public enum PermissionEnum {
    CART_CREATE,
    CART_READ,
    CART_DELETE,

    ORDER_LIST,
    ORDER_READ,
    ORDER_CREATE,

    INVOICE_READ,

    PRODUCT_CREATE,
    PRODUCT_UPDATE,
    PRODUCT_DELETE,

    CATEGORY_CREATE,
    CATEGORY_UPDATE,
    CATEGORY_DELETE,

    ADMIN_PRODUCTS_CUSTOMERS,

    CUSTOMER_LOGOUT,
    ADMIN_LOGOUT;

    public String getPermission() {
        return name();
    }
}
