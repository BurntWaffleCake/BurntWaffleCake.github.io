/*head -n 100 random.txt | swift selectionSort.swift*/ 
import Foundation
func inptStrings() -> [String] {
    var strings : [String] = []
    while let x = readLine() {
        strings.append(x)
    }
    return strings
}


func sortSelectionAlt(arrayInpt:[String], _ debug: Bool) {
    var array = arrayInpt
    var pass = 0
    var totalSwaps = 0
    if debug {
        print("Pass: \(pass), Swaps: 0/\(totalSwaps), Array: \(array)")
    }
    pass+=1
    var j = 0
    for a in 0..<array.count-1 {
        var i = array[a]
        var iInd = a
        for b in a..<array.count{
            if array[b] < i {
                i=array[b]
                iInd=b
            }
        }
        if array[a] != i {
            array.swapAt(a,iInd)
        }
        totalSwaps += 1
        if debug {
            print("Pass: \(pass), Swaps: 1/\(totalSwaps), Array: \(array)")
        }
        j+=1
        pass+=1
    }
}

let start = DispatchTime.now()
sortSelectionAlt(arrayInpt: inptStrings(), false)
let end = DispatchTime.now()

let difference = end.uptimeNanoseconds - start.uptimeNanoseconds
let runtime = Double(difference) / 1_000_000.0
print("\(runtime) ms")
