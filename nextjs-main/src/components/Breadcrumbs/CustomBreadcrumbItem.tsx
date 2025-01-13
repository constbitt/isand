import React from "react";

const CustomBreadcrumbItem = ({children}: {children : React.ReactElement | string}) => {
    return <span className="text-blue-main text-5xl mr-5">{children}</span>
}

export default CustomBreadcrumbItem