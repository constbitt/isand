const formatTick = (tick: string) => {
    return tick.length > 20 ? `${tick.slice(0, 10)}...` : tick;
};

export default formatTick;