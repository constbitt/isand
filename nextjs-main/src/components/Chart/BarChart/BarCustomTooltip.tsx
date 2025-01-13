const BarCustomTooltip = ({active, payload, label}: {active : boolean, payload: any[], label: string}) => {
    if (active && payload && payload.length) {
        return (
            <div style={{background: "white", padding: "5px", borderRadius: "10px"}}>
                <p className="label">{label}</p>
                <p className="intro">{`Количество вхождений ${payload[0].value}`}</p>
            </div>
        )
    }

    return null;
}

export default BarCustomTooltip;