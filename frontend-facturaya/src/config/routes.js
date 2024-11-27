import { LayoutGeneral } from "../layouts/LayoutGeneral";
import { Admin } from "../pages/admin/admin";
import { Client } from "../pages/client";
import { Product } from "../pages/product";

const AdminRoutes = [
    {path:"/", component:Admin,layout:LayoutGeneral}
]

const GeneralRoutes = [
    {path:"/clients", component:Client,layout:LayoutGeneral},
    {path:"/products", component:Product,layout:LayoutGeneral}
]

const allRoutesProject = [...AdminRoutes,...GeneralRoutes]
export default allRoutesProject
