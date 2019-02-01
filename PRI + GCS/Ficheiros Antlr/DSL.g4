/*
 * Linguagem: Linguagem para definir um sistema de armazenamento de noticias
 * Processador: GIC que permite criar um ficheiro json apartir de uma notica
 * Frederico Pinto e Rui Vieira
 */

grammar DSL;

@header{
      import java.lang.Object;
      import java.util.HashMap;
      import java.util.Map;
      import javafx.util.Pair; 
      import java.util.ArrayList;
      import org.json.simple.JSONObject;
      import org.json.simple.JSONArray;
      import org.json.simple.parser.ParseException;
      import org.json.simple.parser.JSONParser;
}


noticias: (noticia)*
       ;

noticia returns[JSONObject obj]
        @init{
            $noticia.obj = new JSONObject();
        }
        @after{
            StringWriter out = new StringWriter();
            $noticia.obj.writeJSONString(out);
            String jsonText = out.toString();
            FileWriter fileWriter = new FileWriter("./noticia.json");
            PrintWriter printWriter = new PrintWriter(fileWriter);
            printWriter.print(jsonText);
            printWriter.close();
        }
        :meta[$noticia.obj] titulo[$noticia.obj]  corpo[$noticia.obj]
         ;

titulo [JSONObject obj]
    :'TITULO:' '{'TEXTO'}' { $titulo.obj.put("titulo",$TEXTO.text);}
    ;

corpo [JSONObject obj]
    : 'CORPO:' '{'TEXTO'}' { $corpo.obj.put("corpo",$TEXTO.text);}
    ;

meta [JSONObject obj] returns [JSONObject metaObj]
    @init{
        $meta.metaObj = new JSONObject();
    }
    : data[$meta.metaObj] autor[$meta.metaObj] (tema[$meta.metaObj])? {obj.put("meta", metaObj); }
    ;

autor [JSONObject metaObj]
    :'AUTOR:' TEXTO {$autor.metaObj.put("autor",$TEXTO.text);}
    ;

tema [JSONObject metaObj]
    :'TEMA:' TEXTO {$tema.metaObj.put("tema",$TEXTO.text);}
    ;

data [JSONObject metaObj]
    :'DATA:' DATA {$data.metaObj.put("data",$DATA.text);}
    ;

/* Definicao do Analisador LEXICO */

TEXTO: (('\"') ~('\'')* ('\"'));

IDENT : LETRA(LETRA|[0-9-_/])* ;

fragment LETRA : [a-zA-ZáéíóúÁÉÍÓÚÃãÕõâêôÂÊÔÀÈÌÒÙàèìòùÇç] ;

Separador: ('\r'? '\n' | ' ' | '\t')+  -> skip;

DATA: [0-9]?[0-9] '\/' [0-9][0-9] '\/' [0-9][0-9][0-9][0-9];

NUMERO: ('0'..'9')+ ; // [0-9]+
