/*head -n 100 random.txt | swift insertionSort.swift*/
import Foundation
func inptStrings() -> [String] {
    var strings : [String] = []
    while let x = readLine() {
        strings.append(x)
    }
    return strings
}

func sortInsertion(inptArray: [String], _ debug: Bool) {
    var array = inptArray
    var pass = 0
    var totalSwaps = 0
    for count in 0..<array.count {
        var swaps = 0
        var i = count
        while i > 0 {
            if array[i] < array[i-1] {
                array.swapAt(i-1,i)
                swaps += 1
                totalSwaps += 1
            } else {
                break
            }
            i -= 1
        }
        if debug {
            print("Pass: \(pass), Swaps: \(swaps)/\(totalSwaps), Array: \(array)")
        }
        pass += 1
    }
}

let start = DispatchTime.now()
sortInsertion(inptArray: inptStrings(), false)
let end = DispatchTime.now()

let difference = end.uptimeNanoseconds - start.uptimeNanoseconds
let runtime = Double(difference) / 1_000_000.0
print("\(runtime) ms")
