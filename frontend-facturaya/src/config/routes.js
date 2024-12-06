import { LayoutGeneral } from "../layouts/LayoutGeneral";
import { Client } from "../pages/client/client";
import { Product } from "../pages/product/product";
import {Facturas} from "../pages/facturas/Facturas"
import {Inventarios} from "../pages/inventario/Inventarios"
const AdminRoutes = [
    {path:"/", component:Facturas,layout:LayoutGeneral}
]

const GeneralRoutes = [
    {path:"/clients", component:Client,layout:LayoutGeneral},
    {path:"/products", component:Product,layout:LayoutGeneral},
    {path:"/inventarios", component:Inventarios,layout:LayoutGeneral}
]

const allRoutesProject = [...AdminRoutes,...GeneralRoutes]
export default allRoutesProject
