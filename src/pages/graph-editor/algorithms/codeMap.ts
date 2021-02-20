module.exports = {
    dfsfindpath: {
        pseudo: [
            "Start with the given vertice;",
            "Move forward to its successor;",
            "Cannot move forward, move backward to its predecessor;"
        ]
    },
    bfsfindpath: {
        pseudo: [
            "\[\pi \left( {{\rm{startPoint}}} \right) = 0\]; \[\pi \left( {\rm{i}} \right) = \infty \]; enqueue(startPoint);",
            "while queueNotEmpty():",
            [
                "v = dequeue();",
                "\[\pi \left( u \right) = \pi \left( v \right) + 1,\;u \in {\Gamma ^ + }\left( v \right)\];"
            ]
        ]
    },
    criticalpath: {
        pesudo: [
            "for i = 1 to n:",
            [
                "v = findZeroDegreeVertice(); markTopoSequence(v);",
                "for u in \[{\Gamma ^ - }\left( v \right)\]: degree[u]--;"
            ],
            "\[\pi \left( {{v_1}'} \right) = 0\];",
            "for i = 2 to n:",
            [
                "\[\pi \left( {{v_i}'} \right) = \mathop {\max }\limits_{{v_j}' \in {\Gamma ^ - }\left( {{v_i}'} \right)} \left( {\pi \left( {{v_j}'} \right) + w\left( {{v_j}',{v_i}'} \right)} \right)\]"
            ]
        ]
    },
    ford: {
        pesudo: [
            "\[\pi \left( {{\rm{startPoint}}} \right) = 0\]; \[\pi \left( {\rm{i}} \right) = \infty \];",
            "while data been updated:",
            [
                "for i = 2 to n:",
                [
                    "\[\pi \left( {\rm{i}} \right) = \min \left[ {\pi \left( {\rm{i}} \right),\mathop {\min }\limits_{j \in {\Gamma ^ - }\left( i \right)} \left( {\pi \left( {\rm{j}} \right) + {w_{ji}}} \right)} \right]\];"
                ]
            ]
        ]
    },
    kruskal: {
        pesudo: [
            "while \[\left| T \right| < n - 1\] and \[E \ne \phi \]:",
            [
                "choose e as the shortest edge in E; E = E - e;",
                "T = T + e if no loop in T + e;"
            ]
        ]
    },
    prim: {
        pesudo: [
            "T = \[\phi \]; U = \[\left\{ {{v_1}} \right\}\];",
            "while \[U \ne V\]:",
            [
                "find \[e\left( {u,v} \right),w\left( {u,v} \right) = \min \left[ {w\left( {{v_i},{v_j}} \right)} \right],u \in U,v \in V - U\]",
                "\[T = T + e\left( {u,v} \right)\]; \[U = U + v\];"
            ]
        ]
    },
    salesmanprob: {
        pesudo: [
            "sort edges by distance;",
            "while limit not reached:",
            [
                "choose enough edges and update the answer;",
                "delete edges chosen last;"
            ]
        ]
    },
    salesmancheaperalgo: {
        pesudo: [
            "\[T = \left( {1,1} \right)\]; \[\overline S  = \left\{ {{v_2}, \ldots ,{v_n}} \right\}\];",
            "while \[\overline S  \ne \phi \]:",
            [
                "find \[e\left( {u,v} \right),w\left( {u,v} \right) = \min \left[ {w\left( {{v_i},{v_j}} \right)} \right],u \in \overline S ,v \in V - \overline S \], insert u into T as v's predecessor or successor; \[\overline S  = \overline S  - u\];"
            ]

        ]
    }
}
