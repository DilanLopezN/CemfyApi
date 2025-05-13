export const clausulas = (assignee, graveyard) => `

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Concessão de Uso de Gaveta Individual à Locação</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            margin: 30px;
            line-height: 1.0;
            text-align: justify;
        }
        h1 {
            text-align: center;
            text-transform: uppercase;
            font-size: 1.4em;
        }
        h2 {
            text-align: center;
            font-size: 1.2em;
            text-decoration: underline;
        }
        .clause {
            margin-bottom: 30px;
        }
        .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .signature div {
            text-align: center;
            width: 40%;
        }
        .signature div p {
            margin-top: 60px;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        ul li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <h1>Concessão de Uso de Gaveta Individual por Prazo Determinado (Locação)</h1>
    <p><strong>Nº do contrato:</strong> ${assignee?.contractNumber}</p>
    
    <p>São partes no presente contrato de concessão de uso de gaveta por prazo determinado:</p>

    <p><strong>Concedente:</strong>  ${graveyard?.nameEnterprise}, com sede na ${graveyard?.street}, ${graveyard?.streetNumber} – ${graveyard?.neighborhood} – ${graveyard?.city} –  ${graveyard?.state}, inscrita no CNPJ sob o nº ${graveyard?.cnpj}, neste ato representada pela proprietária-administradora do ${graveyard?.nameGraveyards}</p>

    <p><strong>Cessionário(a):</strong></p>
    <ul>
        <li><strong>Nome:</strong> ${assignee?.name}</li>
        <li><strong>Nacionalidade:</strong> ${assignee?.nationality}</li>
        <li><strong>Estado civil:</strong> ${assignee?.maritalStatus}</li>
        <li><strong>Profissão:</strong> ${assignee?.profession}</li>
        <li><strong>RG:</strong> ${assignee?.rg}, expedido por ${assignee?.rgIssuer}</li>
        <li><strong>CPF:</strong> ${assignee?.cpf}</li>
        <li><strong>Data de nascimento:</strong> ${assignee?.birthdate}</li>
        <li><strong>Endereço:</strong> ${assignee?.address}, ${assignee?.city}, ${assignee?.state}</li>
        <li><strong>Telefone:</strong> ${assignee?.phone}</li>
    </ul>

    <div class="clause">
        <h2>Cláusula Primeira - Do Objeto</h2>
        <p>A concedente concede ao(à) Cessionário(a) o uso da gaveta nº <b> ${assignee?.drawers?.identificator}</b>, localizada no jazigo nº <b>${assignee?.valts?.identificator}</b>, da quadra <b>${assignee?.squares?.identificator} </b>, do "${graveyard?.nameGraveyards}", por prazo determinado de ${assignee?.dueDate} .</p>
    </div>

    <div class="clause">
        <h2>Cláusula Segunda - Do Uso</h2>
        <p>A gaveta objeto da presente concessão destina-se exclusivamente ao sepultamento de ${assignee?.nameDeceased}.
        
    </div>

    <div class="clause">
        <h2>Cláusula Terceira - Da Concessão</h2>
        <p>A presente concessão de uso é feita pelo prazo certo de ${assignee?.dueDate}, estando sujeita à condição de o(a) cessionário(a) ou seus sucessores cumprirem suas obrigações, em especial no que diz respeito ao pagamento das taxas de administração e conservação em acordo com a cláusula quinta, parágrafo primeiro</p>
    </div>

    <div class="clause">
        <h2>Cláusula Quarta - Do Preço</h2>
        <p>O(a) Cessionário(a) obriga-se a pagar o preço de ${assignee?.saleValue}, pago em ${assignee?.paymentDate} </p>
        
        <p> O valor ajustado ficara sob responsabilidade da funerária ARCE ACESSORIA FAMILIAR Ltda, com sede na Rodovia Regis Bittencourt, 2861 – Cidade Intercap – Município de Taboão da Serra – São Paulo portadora do CNPJ 24.522.750/0001-91, intermediadora deste. </p>

        <p><b>1º §</b>A cobrança das parcelas vincendas será feita por via de boletos bancários, a serem remetidos ao endereço do(a) concessionário(a), que deverá efetuar o respectivo pagamento diretamente ao banco autorizado. </p>

        <p><b>2º §</b> Na hipótese de atraso, as parcelas vincendas estarão sujeitas à multa de 2% e juros moratórios de 0,033% ao dia. Após 30 dias haverá também atualização monetária pelo IGPM/FGV ou qualquer outro índice que venha substituí-lo. </p>	

        <p><b>3º §</b> As taxas de serviços específicos serão pagas diretamente à administração do cemitério pelo valor da tabela vigente à época de cada evento. </p>
    </div>

    <div class="clause">
        <h2>Cláusula Quinta - Rescisão Contratual</h2>
        <p>O presente contrato será rescindido de pleno direito, independentemente de prévia notificação, no caso de o(a) Cessionário(a) deixar de pagar três parcelas consecutivas do preço ajustado ou duas da taxa semestral de administração e conservação e o objeto do presente contrato voltará à concedente. Ainda se houver sepultado o mesmo poderá ser exumado, contando 3 anos e 4 meses da data do sepultamento, e transferido para o coletivo de inadimplentes.</p>

        <p><b>1º §</b> Os pagamentos realizados não serão devolvidos </p>
    </div>

    <div class="clause">
        <h2>Cláusula Sexta - Da Regulamento</h2>
        <p>O contrato será rescindido em caso de inadimplência, e os pagamentos realizados não serão devolvidos.</p>
    </div>

    <div class="clause">
        <h2>Cláusula Sétima - Da Extinção da Concessão</h2>
        <p>Faz parte integrante do presente contrato o regulamento do “Cemitério Memorial Bosque da Paz”, o qual foi rubricado pelo(a) Cessionário(a), dele tomando pleno conhecimento, ao expressamente aceitar todas as suas normas.</p>
    </div>

    <div class="clause">
        <h2>Cláusula Oitava - Da Exumação</h2>
        <p>O Cessionário autoriza a exumação dos restos mortais ao término do contrato, que, se não reivindicados, serão encaminhados ao ossuário coletivo.</p>
    </div>

    <div class="clause">
        <h2>Cláusula Nona - Do Foro</h2>
        <p>Fica eleito o foro da comarca de Cotia para dirimir quaisquer dúvidas decorrentes deste contrato.</p>
    </div>

    <div class="signature">
        <div>
            <p><b>Concedente</b></p>
            <p>___________________________________</p>
            <p>${graveyard?.nameEnterprise}.</p>
        </div>
        <div>
            <p><b>Cessionário</b></p>
            <p>___________________________________</p>
            <p>${assignee?.name}</p>
        </div>
    </div>

    <p><strong>Data:</strong> ${assignee?.contractDate}</p>
</body>
</html>
`;
