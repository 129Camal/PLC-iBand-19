noticia = m:meta t:titulo c:corpo {return {meta:m, titulo:t, corpo:c}}

meta = data:data autor:autor {return {data, autor}}

data = "DATA:" _ d:word _ ':' _ {return d}

autor = "AUTOR:" _ a:(word _)+ ':' _ {return a.toString().replace(/,/g, "")}

titulo = "TITULO:" _ t:(word _)+ ':' _ {return t.toString().replace(/,/g, "")}

corpo = "CORPO:" _ c:(word _)+ ':' _ {return c.toString().replace(/,/g, "")}

word = l:letter+ {return l.join("")} 

letter = [a-zA-ZáéíóúÁÉÍÓÚÃãÕõâêôÂÊÔÀÈÌÒÙàèìòùÇç0-9_/]

_ "whitespace"
  = [ \t\n\r]*
