const fprint = (head = String, text) => {
    if(head.length % 2 == 0){
        console.log(`[${head.padStart((10 + head.length) / 2).padEnd(10)}] ${text}`)
    } else {
        console.log(`[${head.padStart((10 + head.length) / 2).padEnd(9)}] ${text}`)
    }
}

module.exports = {fprint}