func inptStrings() -> [String] {
    var strings : [String] = []
    while let x = readLine() {
        strings.append(x)
    }
    return strings
}

func sortArray(input:[String])->[String] {
    var array = input
    for i in 0..<array.count{
        for c in 0..<array.count-1-i {
            if array[c] > array[c+1] {
                array.swapAt(c, c+1)
            }
        }
    }
    return array
}
sortArray(input:inptStrings())
