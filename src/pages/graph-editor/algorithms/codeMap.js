module.exports = {
  mf_ff: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>FordFulkerson</u> ($\\mathrm{G}$, $s$, $t$):",
      [
        "**comment**:",
        [
          "Ford-Fulkerson Algorithm for Maximum Flow, **return** maximum *flow* of $\\mathrm{G}$ from $s$ to $t$.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *network flow graph*;  $\\mathrm{E}\\subset\\left\\{\\left(u,v,c\\right)\\middle|u,v\\in\\mathrm{V}\\right\\}$: *set* of *edge*;  $c$: *capacity* of *edge*;  $s,t\\in\\mathrm{V}$: *source vertex* and *sink vertex*;  $\\mathrm{G}_r=\\left(\\mathrm{V},\\mathrm{E}_r\\right)$: *residual graph* of $\\mathrm{G}$;  $\\mathrm{E}_r\\subset\\left\\{e=\\left(u,v,r_e\\right)\\right\\}$: *set* of *residual edge*, $\\forall \\left(u,v,c\\right)\\in\\mathrm{E}:\\ e=\\left(u,v,r_e\\right),\\bar{e}=(v,u,r_{\\bar{e}})\\in\\mathrm{E}_r,r_e+r_{\\bar{e}}=c$;  $r_e$: *residual capacity*, *capacity* of $e$;  $\\bar{e}$: *reverse edge* of $e$;  *valid edge* $e\\in\\mathrm{E}_r$: $r_e>0$;  *augmenting path*: *path* through ONLY *valid edge*;  $\\mathrm{P}_{st}$: *augmenting path* from $s$ to $t$."
        ],
        "**function** <u>dfsFindAugmentingPathFrom</u> ($v$):",
        [
          "**comment**:",
          [
            "find *augmenting path* using **DFS**, **return** whether $\\exists$ *augmenting path* from $v$ to $t$.",
            "$v$: current *vertex*."
          ],
          "mark $v$ as *visited*.",
          "**if** $v=t$:  **return** **true**.    **comment**:  found $\\mathrm{P}_{st}.$",
          "**for each** *valid edge* $\\left(v,u,r_e\\right)\\in\\mathrm{E}_r$:",
          ["**if** $u$ is not *visited* **and** <u>dfsFindAugmentingPathFrom</u> ($u$):  **return** **true**."],
          "**return** **false**."
        ],
        "**for each** $\\left(u,v,c\\right)\\in\\mathrm{E}$:  $r_e:=c$, $r_{\\bar{e}}:=0$.",
        "$maxflow:=0$.  $\\color\\red{\\bullet}$",
        "**while** <u>dfsFindAugmentingPathFrom</u> ($s$):  $\\color\\red{\\bullet}$",
        [
          "$\\delta:=$ **minimum** of $r_e$ **for each** $e\\in\\mathrm{P}_{st}$.",
          "**for each** $e\\in\\mathrm{P}_{st}$:  $r_e:=r_e-\\delta$, $r_{\\bar{e}}:=r_{\\bar{e}}+\\delta$.",
          "$maxflow:=maxflow+\\delta$.  $\\color\\red{\\bullet}$",
          "clear *visited* mark **for each** $v\\in\\mathrm{V}$."
        ],
        "$\\color\\red{\\bullet}$  **return** $maxflow$."
      ]
    ]
  },
  mf_ek: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>EdmondsKarp</u> ($\\mathrm{G}$, $s$, $t$):",
      [
        "**comment**:",
        [
          "Edmonds-Karp Algorithm for Maximum Flow, **return** maximum *flow* of $\\mathrm{G}$ from $s$ to $t$.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *network flow graph*;  $\\mathrm{E}\\subset\\left\\{\\left(u,v,c\\right)\\middle|u,v\\in\\mathrm{V}\\right\\}$: *set* of *edge*;  $c$: *capacity* of *edge*;  $s,t\\in\\mathrm{V}$: *source vertex* and *sink vertex*;  $\\mathrm{G}_r=\\left(\\mathrm{V},\\mathrm{E}_r\\right)$: *residual graph* of $\\mathrm{G}$;  $\\mathrm{E}_r\\subset\\left\\{e=\\left(u,v,r_e\\right)\\right\\}$: *set* of *residual edge*, $\\forall \\left(u,v,c\\right)\\in\\mathrm{E}:\\ e=\\left(u,v,r_e\\right),\\bar{e}=(v,u,r_{\\bar{e}})\\in\\mathrm{E}_r,r_e+r_{\\bar{e}}=c$;  $r_e$: *residual capacity*, *capacity* of $e$;  $\\bar{e}$: *reverse edge* of $e$;  *valid edge* $e\\in\\mathrm{E}_r$: $r_e>0$;  *augmenting path*: *path* through ONLY *valid edge*;  $\\mathrm{P}_{st}$: *augmenting path* from $s$ to $t$."
        ],
        "**function** <u>bfsFindAugmentingPath</u> ():",
        [
          "**comment**:",
          [
            "find *augmenting path* using **BFS**, **return** whether $\\exists$ $\\mathrm{P}_{st}$.",
            "$\\mathrm{Q}$: *queue*."
          ],
          "clear $\\mathrm{Q}$, clear *visited* mark **for each** $v\\in\\mathrm{V}$",
          "mark $s$ as *visited*, push $s$ into $\\mathrm{Q}$.",
          "**while** $\\mathrm{Q}$ is not *empty*:",
          [
            "$v:=$ *front* of $\\mathrm{Q}$, pop $v$ from $\\mathrm{Q}$.",
            "**if** $v=t$:  **return** **true**.    **comment**:  found $\\mathrm{P}_{st}$",
            "**for each** *valid edge* $\\left(v,u,r_e\\right)\\in\\mathrm{E}_r$:",
            ["**if** $u$ is not *visited*:", ["mark $u$ as *visited*, push $u$ into $\\mathrm{Q}$."]]
          ],
          "**return** **false**."
        ],
        "**for each** $\\left(u,v,c\\right)\\in\\mathrm{E}$:  $r_e:=c$, $r_{\\bar{e}}:=0$.",
        "$maxflow:=0$.  $\\color\\red{\\bullet}$",
        "**while** <u>bfsFindAugmentingPath</u> ():  $\\color\\red{\\bullet}$",
        [
          "$\\delta:=$ **minimum** of $r_e$ **for each** $e\\in\\mathrm{P}_{st}$.",
          "**for each** $e\\in\\mathrm{P}_{st}$:  $r_e:=r_e-\\delta$, $r_{\\bar{e}}:=r_{\\bar{e}}+\\delta$.",
          "$maxflow:=maxflow+\\delta$.  $\\color\\red{\\bullet}$"
        ],
        "$\\color\\red{\\bullet}$  **return** $maxflow$."
      ]
    ]
  },
  mf_dinic: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>Dinic</u> ($\\mathrm{G}$, $s$, $t$):",
      [
        "**comment**:",
        [
          "Dinic Algorithm for Maximum Flow, **return** maximum *flow* of $\\mathrm{G}$ from $s$ to $t$.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *network flow graph*;  $\\mathrm{E}\\subset\\left\\{\\left(u,v,c\\right)\\middle|u,v\\in\\mathrm{V}\\right\\}$: *set* of *edge*;  $c$: *capacity* of *edge*;  $s,t\\in\\mathrm{V}$: *source vertex* and *sink vertex*;  $\\mathrm{G}_r=\\left(\\mathrm{V},\\mathrm{E}_r\\right)$: *residual graph* of $\\mathrm{G}$;  $\\mathrm{E}_r\\subset\\left\\{e=\\left(u,v,r_e\\right)\\right\\}$: *set* of *residual edge*, $\\forall \\left(u,v,c\\right)\\in\\mathrm{E}:\\ e=\\left(u,v,r_e\\right),\\bar{e}=(v,u,r_{\\bar{e}})\\in\\mathrm{E}_r,r_e+r_{\\bar{e}}=c$;  $r_e$: *residual capacity*, *capacity* of $e$;  $\\bar{e}$: *reverse edge* of $e$;  *valid edge*: $e\\in\\mathrm{E}_r,r_e>0$;  *augmenting path*: *path* through ONLY *valid edge*;  $\\mathrm{P}_{st}$: *augmenting path* from $s$ to $t$;  $depth_v$: *minimum distance* of $v\\in\\mathrm{V}$ through *valid edge* from $s$."
        ],
        "**function** <u>bfsCalculateDepth</u> ():",
        [
          "**comment**:",
          [
            "calculate $depth_v$ for all *vertex* using **BFS**, **return** whether $t$ is *reachable* from $t$ in $\\mathrm{G}_l$.",
            "$\\mathrm{Q}$: *queue*."
          ],
          "clear $\\mathrm{Q}$, clear *visited* mark **for each** $v\\in\\mathrm{V}$.",
          "mark $s$ as *visited*, push $s$ into $\\mathrm{Q}$, $depth_s:=0$.",
          "**while** $\\mathrm{Q}$ is not *empty*:",
          [
            "$v:=$ *front* of $\\mathrm{Q}$, pop $v$ from $\\mathrm{Q}$.",
            "**if** $v=t$:  **return** **true**.    **comment**:  reached $t$.",
            "**for each** *valid edge* $e=\\left(v,u,r_e\\right)\\in\\mathrm{E}_r$:",
            [
              "**if** $u$ is not *visited*:",
              ["mark $u$ as *visited*, push $u$ into $\\mathrm{Q}$, $depth_u:=depth_v+1$."]
            ]
          ],
          "**return** **false**."
        ],
        "**function** <u>dfsAugment</u> ($v$, $limit$):",
        [
          "**comment**:",
          [
            "augment in $\\mathrm{G}_r$ using **DFS**, **return** *flow* augmented.",
            "$v$: current *vertex*;  $limit$: *upperbound* of *flow* to be augmented."
          ],
          "**if** $v=t$:  $\\color\\red{\\bullet}$  **return** $limit$.    **comment**:  reach $t$, augment by $limit$.",
          "$\\sigma:=0$.",
          "**for each** *unchecked valid edge* $e=\\left(v,u,r_e\\right)\\in\\mathrm{E}_r$:",
          [
            "**if** $depth_u=depth_v+1$:    **comment**:  $e$ is in *level graph* of $\\mathrm{G}_r$ with respect to $depth_\\mathrm{V}$.",
            [
              "$\\delta:=$ <u>dfsAugment</u> ($u$, **minimum** of $limit$ and $r_e$).",
              "$r_e:=r_e-\\delta$, $r_{\\bar{e}}:=r_{\\bar{e}}+\\delta$.",
              "$limit:=limit-\\delta$, $\\sigma:=\\sigma+\\delta$.",
              "**if** $limit=0$:  **return** $\\sigma$;",
              "mark $e$ as *checked*."
            ]
          ],
          "**return** $\\sigma$."
        ],
        "**for each** $\\left(u,v,c\\right)\\in\\mathrm{E}$:  $r_e:=c$, $r_{\\bar{e}}:=0$.",
        "$maxflow:=0$.  $\\color\\red{\\bullet}$",
        "**while** <u>bfsCalculateDepth</u> ():  $\\color\\red{\\bullet}$",
        [
          "**for each** $e\\in\\mathrm{E}_r$:  mark $e$ as *unchecked*.",
          "$\\delta:=$ <u>dfsAugment</u> ($s$, $+\\infty$).",
          "$maxflow:=maxflow+\\delta$.  $\\color\\red{\\bullet}$"
        ],
        "$\\color\\red{\\bullet}$  **return** $maxflow$."
      ]
    ]
  },
  mcf_classic: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>ClassicMCF</u> ($\\mathrm{G}$, $s$, $t$, $flowlimit$):",
      [
        "**comment**:",
        [
          "Classic Algorithm for Minimum-Cost maximum Flow, **return** maximum *flow* ($\\leq flowlimit$) of $\\mathrm{G}$ from $s$ to $t$ and its minimum *cost*.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *weighted network flow graph*;  $\\mathrm{E}\\subset\\left\\{\\left(u,v,c_a,c_o\\right)\\middle|u,v\\in\\mathrm{V}\\right\\}$: *set* of *edge*;  $c_a$: *capacity* of *edge*;  $c_o$: *cost* of *edge*;  $s,t\\in\\mathrm{V}$: *source vertex* and *sink vertex*;  $flowlimit$: *upperbound* of maximum *flow*;  $\\mathrm{G}_r=\\left(\\mathrm{V},\\mathrm{E}_r\\right)$: *residual graph* of $\\mathrm{G}$;  $\\mathrm{E}_r\\subset\\left\\{e=\\left(u,v,r_e,c_e\\right)\\right\\}$: *set* of *residual edge*, $\\forall \\left(u,v,c_a,c_o\\right)\\in\\mathrm{E}:\\ e=\\left(u,v,r_e,c_o\\right),\\bar{e}=(v,u,r_{\\bar{e}},-c_o)\\in\\mathrm{E}_r,r_e+r_{\\bar{e}}=c$;  $r_e$: *residual capacity*, *capacity* of $e$;  $\\bar{e}$: *reverse edge* of $e$;  *valid edge* $e\\in\\mathrm{E}_r$: $r_e>0$;  *augmenting path*: *minimum-cost path* through ONLY *valid edge*;  $\\mathrm{P}_{st}$: *augmenting path* from $s$ to $t$;  $dis_v$: minimum *cost* from $s$ to $v$."
        ],
        "**function** <u>spfaFindAugmentingPath</u> ():",
        [
          "**comment**:",
          [
            "find *minimum-cost* *augmenting path* using **SPFA**, **return** whether $\\exists$ $\\mathrm{P}_{st}$.",
            "$\\mathrm{Q}$: *queue*."
          ],
          "clear $\\mathrm{Q}$.",
          "**for each** $v\\in\\mathrm{V}$:  $dis_v:=+\\infty$.",
          "$dis_s:=0$, push $s$ into $\\mathrm{Q}$, mark $s$ as *inqueue*.",
          "**while** $\\mathrm{Q}$ is not *empty*:",
          [
            "$v:=$ *front* of $\\mathrm{Q}$, pop $v$ from $\\mathrm{Q}$, clear *inqueue* mark of $v$.",
            "**for each** *valid edge* $\\left(v,u,r_e,c_e\\right)\\in\\mathrm{E}_r$:",
            [
              "**if** $dis_u>dis_v+c_e$:",
              [
                "$dis_u:=dis_v+c_e$.",
                "**if** $u$ is not *inqueue*:",
                ["push $u$ into $\\mathrm{Q}$, mark $u$ as *inqueue*."]
              ]
            ]
          ],
          "**return** whether $dis_t\\neq+\\infty$.    **comment**:  $dis_t\\neq+\\infty\\Leftrightarrow$ $t$ is *reachable* through *valid edge* from $s\\Leftrightarrow\\exists\\ \\mathrm{P}_{st}$."
        ],
        "**for each** $\\left(u,v,c_a,c_o\\right)\\in\\mathrm{E}$:  $r_e:=c_a$, $r_{\\bar{e}}:=0$, $c_e:=c_o$, $c_{\\bar{e}}:=-c_o$.",
        "$maxflow:=0$, $mincost:=0$  $\\color\\red{\\bullet}$",
        "**while** <u>spfaFindAugmentingPath</u> ():  $\\color\\red{\\bullet}$",
        [
          "$\\delta:=$ **minimum** of $flowlimit$ and $r_e$ **for each** $e\\in\\mathrm{P}_{st}$.",
          "**for each** $e\\in\\mathrm{P}_{st}$:  $r_e:=r_e-\\delta$, $r_{\\bar{e}}:=r_{\\bar{e}}+\\delta$.",
          "$flowlimit:=flowlimit-\\delta$.",
          "$maxflow:=maxflow+\\delta$, $mincost:=mincost+\\delta\\cdot dis_t$  $\\color\\red{\\bullet}$"
        ],
        "$\\color\\red{\\bullet}$  **return** $maxflow$, $mincost$."
      ]
    ]
  },
  mcf_zkw: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>ZkwMCF</u> ($\\mathrm{G}$, $s$, $t$):",
      [
        "**comment**:",
        [
          "Zkw's Algorithm for Minimum-Cost maximum Flow, **return** maximum *flow* ($\\leq flowlimit$) of $\\mathrm{G}$ from $s$ to $t$ and its minimum *cost*.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *weighted network flow graph*;  $\\mathrm{E}\\subset\\left\\{\\left(u,v,c_a,c_o\\right)\\middle|u,v\\in\\mathrm{V}\\right\\}$: *set* of *edge*;  $c_a$: *capacity* of *edge*;  $c_o$: *cost* of *edge*;  $s,t\\in\\mathrm{V}$: *source vertex* and *sink vertex*;  $flowlimit$: *upperbound* of maximum *flow*;  $\\mathrm{G}_r=\\left(\\mathrm{V},\\mathrm{E}_r\\right)$: *residual graph* of $\\mathrm{G}$;  $\\mathrm{E}_r\\subset\\left\\{e=\\left(u,v,r_e,c_e\\right)\\right\\}$: *set* of *residual edge*, $\\forall \\left(u,v,c_a,c_o\\right)\\in\\mathrm{E}:\\ e=\\left(u,v,r_e,c_o\\right),\\bar{e}=(v,u,r_{\\bar{e}},-c_o)\\in\\mathrm{E}_r,r_e+r_{\\bar{e}}=c$;  $r_e$: *residual capacity*, *capacity* of $e$;  $\\bar{e}$: *reverse edge* of $e$;  *valid edge* $e\\in\\mathrm{E}_r$: $r_e>0$;  *augmenting path*: *minimum-cost path* through ONLY *valid edge*;  $\\mathrm{P}_{st}$: *augmenting path* from $s$ to $t$;  $dis_v$: minimum *cost* from $s$ to $v$."
        ],
        "**function** <u>spfaFindAugmentingPath</u> ():",
        [
          "**comment**:",
          [
            "find *minimum-cost* *augmenting path* using **SPFA**, **return** whether $\\exists$ $\\mathrm{P}_{st}$.",
            "$\\mathrm{Q}$: *queue*."
          ],
          "clear $\\mathrm{Q}$.",
          "**for each** $v\\in\\mathrm{V}$:  $dis_v:=+\\infty$.",
          "$dis_s:=0$, push $s$ into $\\mathrm{Q}$, mark $s$ as *inqueue*.",
          "**while** $\\mathrm{Q}$ is not *empty*:",
          [
            "$v:=$ *front* of $\\mathrm{Q}$, pop $v$ from $\\mathrm{Q}$, clear *inqueue* mark of $v$.",
            "**for each** *valid edge* $\\left(v,u,r_e,c_e\\right)\\in\\mathrm{E}_r$:",
            [
              "**if** $dis_u>dis_v+c_e$:",
              [
                "$dis_u:=dis_v+c_e$.",
                "**if** $u$ is not *inqueue*:",
                ["push $u$ into $\\mathrm{Q}$, mark $u$ as *inqueue*."]
              ]
            ]
          ],
          "**return** whether $dis_t\\neq+\\infty$.    **comment**:  $dis_t\\neq+\\infty\\Leftrightarrow$ $t$ is *reachable* through *valid edge* from $s\\Leftrightarrow\\exists\\ \\mathrm{P}_{st}$."
        ],
        "**function** <u>dfsAugment</u> ($v$, $limit$):",
        [
          "**comment**:",
          [
            "augment in $\\mathrm{G}_r$ using **DFS**, **return** *flow* augmented.",
            "$v$: current *vertex*;  $limit$: *upperbound* of *flow* to be augmented."
          ],
          "**if** $v=t$:  $\\color\\red{\\bullet}$  **return** $limit$.    **comment**:  reach $t$, augment by $limit$.",
          "mark $v$ as *visited*, $\\sigma:=0$.",
          "**for each** *valid edge* $e=\\left(v,u,r_e,c_e\\right)\\in\\mathrm{E}_r$:",
          [
            "**if** $u$ is not *visited* **and** $dis_u=dis_v+c_e$:    **comment**:  $e$ is in *SSSP graph* of $\\mathrm{G}_r$.",
            [
              "$\\delta:=$ <u>dfsAugment</u> ($u$, **minimum** of $limit$ and $r_e$).",
              "$r_e:=r_e-\\delta$, $r_{\\bar{e}}:=r_{\\bar{e}}+\\delta$.",
              "$limit:=limit-\\delta$, $\\sigma:=\\sigma+\\delta$.",
              "**if** $limit=0$:  **return** $\\sigma$;"
            ]
          ],
          "**return** $\\sigma$."
        ],
        "**for each** $\\left(u,v,c_a,c_o\\right)\\in\\mathrm{E}$:  $r_e:=c_a$, $r_{\\bar{e}}:=0$, $c_e:=c_o$, $c_{\\bar{e}}:=-c_o$.",
        "$maxflow:=0$, $mincost:=0$  $\\color\\red{\\bullet}$",
        "**while** <u>spfaFindAugmentingPath</u> ():  $\\color\\red{\\bullet}$",
        [
          "**do**:",
          [
            "clear *visited* mark **for each** $v\\in\\mathrm{V}$.",
            "$\\delta:=$ <u>dfsAugment</u> ($s$, $flowlimit$).",
            "$flowlimit:=flowlimit-\\delta$.",
            "$maxflow:=maxflow+\\delta$, $mincost:=mincost+\\delta\\cdot dis_t$  $\\color\\red{\\bullet}$"
          ],
          "**while** $\\delta>0$."
        ],
        "$\\color\\red{\\bullet}$  **return** $maxflow$, $mincost$."
      ]
    ]
  },
  mbm_hungarian: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>Hungarian</u> ($\\mathrm{G}$):",
      [
        "**comment**:",
        [
          "Hungarian Algorithm for Maximum Bipartite Matching, **return** maximum matching of $\\mathrm{G}$.",
          "$\\mathrm{G}=\\left(\\mathrm{X},\\mathrm{Y},\\mathrm{E}\\right)$: *bipartite graph*;  $\\mathrm{X},\\mathrm{Y}$: *set* of *vertex*;  $\\mathrm{E}\\subset\\left\\{e=\\left(x,y\\right)\\middle|x\\in\\mathrm{X},y\\in\\mathrm{Y}\\right\\}$: *set* of *edge*;  $\\mathrm{P}$: *augmenting path* in $\\mathrm{G}$."
        ],
        "**function** <u>dfsFindAugmentingPathFrom</u> ($x$):",
        [
          "**comment**:",
          [
            "find *augmenting path* using **DFS**, **return** whether $\\exists$ $\\mathrm{P}$ from $x$.",
            "$x$: current *vertex*."
          ],
          "**for each** $\\left(x,y\\right)\\in\\mathrm{E}$:",
          [
            "**if** $y$ is not *visited*:",
            [
              "mark $y$ as *visited*.",
              "**if** $y$ is *matched* with $x'$:",
              ["**if** <u>dfsFindAugmentingPathFrom</u> ($x'$):  **return** **true**."],
              "**else**:  $\\color\\red{\\bullet}$  **return** **true**.    **comment**:  found $\\mathrm{P}$ to $y$."
            ]
          ],
          "**return** **false**."
        ],
        "$matched:=0$.  $\\color\\red{\\bullet}$",
        "**for each** $x\\in\\mathrm{X}$:",
        [
          "clear *visited* mark **for each** $y\\in\\mathrm{Y}$.",
          "**if** <u>dfsFindAugmentingPathFrom</u> ($x$):",
          [
            "**for each** $e\\in\\mathrm{P}_l$: flip *matching status* of $e$ (*matched* $\\leftrightarrow$ *unmatched*).",
            "$matched:=matched+1$.  $\\color\\red{\\bullet}$"
          ]
        ],
        "$\\color\\red{\\bullet}$  **return** $matched$."
      ]
    ]
  },
  mwbm_km: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>KuhnMunkres</u> ($\\mathrm{G}$):",
      [
        "**comment**:",
        [
          "Kuhn-Munkres Algorithm for Maximum Weighted Bipartite Matching, **return** maximum weighted matching of $\\mathrm{G}$",
          "$\\mathrm{G}=\\left(\\mathrm{X},\\mathrm{Y},\\mathrm{E}\\right)$: *weighted bipartite graph*;  $\\mathrm{X},\\mathrm{Y}$: *set* of *vertex*;  $\\mathrm{E}=\\left\\{e_{ij}=\\left(x_i,y_j,w_{ij}\\right)\\middle|x_i\\in\\mathrm{X},y_j\\in\\mathrm{Y}\\right\\}$: *set* of *edge*;  $w_{ij}$: *weight* of $e_{ij}$;  $lx_i,ly_j$: *label* of $x_i,y_j$;  $\\mathrm{S}$: *subset* of $\\mathrm{X}$;  $\\mathrm{T}$: *subset* of $\\mathrm{Y}$;  *tight-edge* $e_{ij}$: $lx_i+ly_j=w_{ij}$;  $\\mathrm{G}_l$: *tight-edge subgraph* of $\\mathrm{G}$;  $\\mathrm{P}_l$: *augmenting path* in $\\mathrm{G}_l$."
        ],
        "**for each** $x_i\\in\\mathrm{X}$:  $lx_i:=$ **maximum** of $w_{ij}$ **for each** $y_j\\in\\mathrm{Y}$.",
        "**for each** $y_j\\in\\mathrm{Y}$:  $ly_j:=0$.  $\\color\\red{\\bullet}$",
        "**for each** $x\\in\\mathrm{X}$:",
        [
          "$\\mathrm{S}:=\\left\\{x\\right\\}$, $\\mathrm{T}:=\\emptyset$.  $\\color\\red{\\bullet}$",
          "**do**:",
          [
            "**while** $\\exists$ *tight edge* $e_{ij}$ from $\\mathrm{S}$ to $\\mathrm{Y}\\backslash\\mathrm{T}$:",
            [
              "add $y_j$ to $\\mathrm{T}$.",
              "**if** $y_j$ is *matched* with $x_k$:  add $x_k$ to $\\mathrm{S}$.  $\\color\\red{\\bullet}$",
              "**else**:  found $\\mathrm{P}_l$ from $x$ to $y_j$, **go to** <u>augment</u>."
            ],
            "$\\delta :=$ **minimum** of  $lx_i+ly_j-w_{ij}$ **for each** $e_{ij}$ from $\\mathrm{S}$ to $\\mathrm{Y}\\backslash\\mathrm{T}$.",
            "**for each** $x_i\\in\\mathrm{S}$:  $lx_i := lx_i -\\delta$.",
            "**for each** $y_j\\in\\mathrm{T}$:  $ly_j := ly_j +\\delta$.  $\\color\\red{\\bullet}$"
          ],
          "**while** $\\nexists$ $\\mathrm{P}_l$."
        ]
      ],
      "<u>augment</u>:  $\\color\\red{\\bullet}$",
      [
        [
          "**for each** $e\\in\\mathrm{P}_l$: flip *matching status* of $e$ (*matched* $\\leftrightarrow$ *unmatched*).   $\\color\\red{\\bullet}$"
        ],
        "$maxweight := $ **summation** of $lx_i$ **for each** $x_i\\in\\mathrm{X}$ $+$  **summation** of $ly_j$ **for each** $y_j\\in\\mathrm{Y}$.",
        "$\\color\\red{\\bullet}$  **return** $maxweight$."
      ]
    ]
  },
  mm_gabow: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is partially simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>Gabow</u> (G):",
      [
        "**comment**:",
        [
          "Gabow Algorithm for Maximum Matching, **return** maximum matching of $\\mathrm{G}$.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *general undirected graph*;  $\\mathrm{P}$: *augmenting path* in $\\mathrm{G}$."
        ],
        "**function** <u>bfsFindAugmentingPathFrom</u> ($s$):",
        [
          "**comment**:",
          [
            "find *augmenting path* using **BFS**, **return** whether $\\exists$ $\\mathrm{P}$ from $s$.",
            "$s$: *start vertex*;  $\\mathrm{Q}$: *queue* for *outer vertex*;  $\\mathrm{F}_{uv}$: *tree flower*(*odd-length circle*) derived from $u$ and $v$."
          ],
          "clear $\\mathrm{Q}$, clear all mark **for each** $v\\in\\mathrm{V}$.",
          "mark $s$ as *outer*, push $s$ into $\\mathrm{Q}$.",
          "**while** $\\mathrm{Q}$ is not *empty*:",
          [
            "$v:=$ *front* of $\\mathrm{Q}$, pop $v$ from $\\mathrm{Q}$.",
            "**for each** $\\left(v,u\\right)\\in\\mathrm{E}$:",
            [
              "**if** $u$ is not *marked*:",
              [
                "**if** $u$ is *matched* with $t$:",
                ["mark $u$ as *inner*.", "mark $t$ as *outer*, push $t$ into $\\mathrm{Q}$."],
                "**else**:  **return** **true**.    **comment**:  found $\\mathrm{P}$ from $s$ to $u$."
              ],
              "**else if** $u$ is marked as *outer*:    **comment**:  found $\\mathrm{F}_{uv}$.",
              ["**for each** *inner* $t\\in\\mathrm{F}_{uv}$:", ["mark $t$ as *outer*, push $t$ into $\\mathrm{Q}$."]]
            ]
          ],
          "**return** **false**."
        ],
        "$matched:=0$.  $\\color\\red{\\bullet}$",
        "**for each** *unchecked* unmatched $v\\in\\mathrm{V}$:",
        [
          "**if** <u>bfsFindAugmentingPathFrom</u> ($v$):  $\\color\\red{\\bullet}$",
          [
            "**for each** $e\\in\\mathrm{P}$: flip *matching status* of $e$ (*matched* $\\leftrightarrow$ *unmatched*).",
            "$matched:=matched+1$.  $\\color\\red{\\bullet}$"
          ]
        ],
        "$\\color\\red{\\bullet}$  **return** $matched$."
      ]
    ]
  },
  pt_dmp: {
    pseudo: [
      "<u>**NOTE**</u>: This Pseudo Code is GREATLY simplified and does NOT strictly correspond to internal implementation.",
      "**function** <u>DMP</u> ($\\mathrm{G}$):",
      [
        "**comment**:",
        [
          "Demoucron-Malgrange-Pertuiset Algorithm for Planar Testing, **return** *planarity* of $\\mathrm{G}$.",
          "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *general undirected graph*;  $\\mathrm{BC}$: *set* of *biconnected component* of $\\mathrm{G}$."
        ],
        "**function** <u>dmpTest</u> ($\\mathrm{G}$):",
        [
          "**comment**:",
          [
            "test *planarity* of *biconnected component* using **DMP**, **return** *planarity* of $\\mathrm{G}$.",
            "$\\mathrm{G}=\\left(\\mathrm{V},\\mathrm{E}\\right)$: *biconnected component*;  $\\mathrm{G}'=\\left(\\mathrm{V}',\\mathrm{E}',\\mathrm{Faces}\\right)$: *planar embedding* of $\\mathrm{G}$;  $\\mathrm{Faces}$: *set* of *face* of $\\mathrm{G}$;  $\\mathrm{ValidFaces}_{fragment}\\subset\\mathrm{Faces}$: *set* of *embeddable face* for $fragment$;  $\\mathrm{Fragments}$: *set* of *fragment* of $\\mathrm{G}$ with respect to $\\mathrm{G}'$;  $\\mathrm{P}_{u,v}$: *path* from $u$ to $v$."
          ],
          "$\\color\\red{\\bullet}$  remove *self loop* and *multiple edges* $\\in\\mathrm{E}$, *vertex* whose *degree* $\\leq 2$ $\\in\\mathrm{}V$.  $\\color\\red{\\bullet}$",
          "**if** $\\left|\\mathrm{E}\\right|<9$ **or** $\\left|\\mathrm{V}\\right|<5$:  **return** **true**.",
          "**if** $\\left|\\mathrm{E}\\right|$ > $3\\left|\\mathrm{V}\\right|-6$:  **return** **false**.",
          "select *arbitrary* $\\left(u,v\\right)\\in\\mathrm{E}$, $\\mathrm{V}':=\\left\\{u,v\\right\\}$, $\\mathrm{E}':=\\left\\{\\left(u,v\\right)\\right\\}$, $\\mathrm{Faces}:=\\left\\{\\left[u,v\\right]\\right\\}$.  $\\color\\red{\\bullet}$",
          "**repeat**:",
          [
            "**if** $\\mathrm{Fragments}=\\emptyset$:  **return** **true**.",
            "**if** $\\exists \\ fragment\\in\\mathrm{Fragments}:\\mathrm{ValidFaces}_{i,fragment}=\\emptyset$:  **return** **false**.",
            "**if** $\\exists \\ fragment\\in\\mathrm{Fragments}:\\mathrm{ValidFaces}_{i,fragment}=\\left\\{face\\right\\}$:  $f_r:=fragment$, $f_a:=face$.",
            "**else**:  $f_r:=$ *arbitrary fragment* $\\in\\mathrm{Fragments}$, $f_a:=$ *arbitrary face* $\\in\\mathrm{ValidFace}_{i,f_r}.$",
            "$\\color\\red{\\bullet}$  select *arbitrary unique* $u,v\\in f_a\\cap f_r$, $\\mathrm{P}_{u,v}:=$ *path* $\\in f_r$ from $u$ to $v$.",
            "**for each** $v\\in\\mathrm{P}_{u,v}\\cap \\mathrm{V}$:  add $v$ into $\\mathrm{V}'$.",
            "**for each** $e\\in\\mathrm{P}_{u,v}\\cap \\mathrm{E}$:  add $e$ into $\\mathrm{E}'$.",
            "split $f_a$ into $newface_1,newface_2$ by $\\mathrm{P}_{u,v}$.",
            "replace $f_a\\in\\mathrm{Faces}$ with $newface_1,newface_2$.  $\\color\\red{\\bullet}$"
          ]
        ],
        "$\\color\\red{\\bullet}$  remove *self loop* and *multiple edges* $\\in\\mathrm{E}$, *vertex* whose *degree* $\\leq 2$ $\\in\\mathrm{}V$.  $\\color\\red{\\bullet}$",
        "**if** $\\left|\\mathrm{E}\\right|<9$ **or** $\\left|\\mathrm{V}\\right|<5$:  $planarity:=$ **true**, **go to** <u>end</u>.",
        "**if** $\\left|\\mathrm{E}\\right|$ > $3\\left|\\mathrm{V}\\right|-6$:  $planarity:=$ **false**, **go to** <u>end</u>.",
        "$planarity:=$ **true**.",
        "split $\\mathrm{G}$ into $\\mathrm{BC}$.  $\\color\\red{\\bullet}$",
        "**for each** $\\mathrm{G}_i\\in\\mathrm{BC}$:",
        ["**if** not <u>dmpTest</u> ($\\mathrm{G}_i$):", ["$planarity:=$ **false**, **go to** <u>end</u>."]]
      ],
      "<u>end</u>:",
      ["$\\color\\red{\\bullet}$  **return** $planarity$."]
    ]
  },
  Dijkstra: {
    pseudo: [
      "Let $\\bar{S}=\\{2,3,\\cdots ,n\\}, \\pi (1)=0, \\pi (i)=\\left\\{\\begin{array}{ll} w_i, i \\in \\Gamma^+_1 \\\\ \\infty, \\text{otherwise} \\\\ \\end{array} \\right.$",
      "In $\\bar{S}$，let $\\pi (j)=\\min_{i\\in\\bar{S}} \\pi (i)$，$\\bar{S}\\leftarrow\\bar{S} - \\{j\\}$. If $\\bar{S}=\\Phi$, end, otherwise, go to step 3.",
      "For all $i\\in \\bar{S}\\cap\\Gamma^+_j$, $\\pi (i)\\leftarrow\\min (\\pi (i), \\pi (j)+w_{ji})$, go to step 2."
    ]
  },
  DFS: {
    pseudo: [
      "Start with the given vertice;",
      "Move forward to its successor;",
      "Cannot move forward, move backward to its predecessor;"
    ]
  },
  BFS: {
    pseudo: [
      "起始点Dist(st) = 0，并将其放入队列queue中；",
      "**while** 队列queue非空：",
      [
        "取出队首元素v，并执行queue.pop()操作使v出队；",
        "对于所有e(v, u)，更新Dist(u) = Dist(v) + 1，并将v放入队列queue中；"
      ]
    ]
  },
  CriticalPath: {
    pesudo: [
      "for i = 1 to n:",
      ["v = findZeroDegreeVertice(); markTopoSequence(v);", "for u in [{Gamma ^ - }left( v \right)]: degree[u]--;"],
      "[pi left( {{v_1}'} \right) = 0];",
      "for i = 2 to n:",
      [
        "[pi left( {{v_i}'} \right) = mathop {max }limits_{{v_j}' in {Gamma ^ - }left( {{v_i}'} \right)} left( {pi left( {{v_j}'} \right) + wleft( {{v_j}',{v_i}'} \right)} \right)]"
      ]
    ]
  },
  Ford: {
    pesudo: [
      "[pi left( {{\rm{startPoint}}} \right) = 0]; [pi left( {\rm{i}} \right) = infty ];",
      "while data been updated:",
      [
        "for i = 2 to n:",
        [
          "[pi left( {\rm{i}} \right) = min left[ {pi left( {\rm{i}} \right),mathop {min }limits_{j in {Gamma ^ - }left( i \right)} left( {pi left( {\rm{j}} \right) + {w_{ji}}} \right)} \right]];"
        ]
      ]
    ]
  },
  Kruskal: {
    pesudo: [
      "while [left| T \right| < n - 1] and [E \ne phi ]:",
      ["choose e as the shortest edge in E; E = E - e;", "T = T + e if no loop in T + e;"]
    ]
  },
  Prim: {
    pesudo: [
      "T = [phi ]; U = [left{ {{v_1}} \right}];",
      "while [U \ne V]:",
      [
        "find [eleft( {u,v} \right),wleft( {u,v} \right) = min left[ {wleft( {{v_i},{v_j}} \right)} \right],u in U,v in V - U]",
        "[T = T + eleft( {u,v} \right)]; [U = U + v];"
      ]
    ]
  },
  SalesmanProblem: {
    pesudo: [
      "sort edges by distance;",
      "while limit not reached:",
      ["choose enough edges and update the answer;", "delete edges chosen last;"]
    ]
  },
  SalesmanCheaperAlgorithm: {
    pesudo: [
      "[T = left( {1,1} \right)]; [overline S  = left{ {{v_2}, ldots ,{v_n}} \right}];",
      "while [overline S  \ne phi ]:",
      [
        "find [eleft( {u,v} \right),wleft( {u,v} \right) = min left[ {wleft( {{v_i},{v_j}} \right)} \right],u in overline S ,v in V - overline S ], insert u into T as v's predecessor or successor; [overline S  = overline S  - u];"
      ]
    ]
  }
};
