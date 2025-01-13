import React from "react";

const DefaultLayout = ({
                           children,
                       }: {
    children: React.ReactNode
}) => {
    return (<div style={{height: "100%", padding: "16px"}}>
            {children}
        </div>
    )
}

export default DefaultLayout