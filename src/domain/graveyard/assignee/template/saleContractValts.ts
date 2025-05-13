export const clausulas = (assignee, graveyard) => `

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promessa de Concessão Perpétua de Jazico Completo</title>
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
    <h1>Concessão de Uso de Jazigo por Prazo Determinado</h1>
    <p><strong>Nº do contrato:</strong> ${assignee.contractNumber}</p>
    
    <p>São partes no presente contrato de concessão de uso de Jazigo por prazo determinado:</p>

    <p><strong>Concedente:</strong>  ${graveyard.nameEnterprise}, com sede na ${graveyard.street}, ${graveyard.streetNumber} – ${graveyard.neighborhood} – ${graveyard.city} –  ${graveyard.state}, inscrita no CNPJ sob o nº ${graveyard.cnpj}, neste ato representada pela proprietária-administradora do ${graveyard.nameGraveyards}</p>

    <p><strong>Cessionário(a):</strong></p>
    <ul>
        <li><strong>Nome:</strong> ${assignee.name}</li>
        <li><strong>Nacionalidade:</strong> ${assignee.nationality}</li>
        <li><strong>Estado civil:</strong> ${assignee.maritalStatus}</li>
        <li><strong>Profissão:</strong> ${assignee.profession}</li>
        <li><strong>RG:</strong> ${assignee.rg}, expedido por ${assignee.rgIssuer}</li>
        <li><strong>CPF:</strong> ${assignee.cpf}</li>
        <li><strong>Data de nascimento:</strong> ${assignee.birthdate}</li>
        <li><strong>Endereço:</strong> ${assignee.address}, ${assignee.city}, ${assignee.state}</li>
        <li><strong>Telefone:</strong> ${assignee.phone}</li>
    </ul>

    <div class="clause">
        <h2>Cláusula Primeira - Do Objeto</h2>
        <p> A concedente promete conceder ao(à) cessionário(a) o jazigo a ser demarcado segundo a opção de quadra a ser feita pelo cessionário mediante pagamento de 50% do valor do jazigo, ou exclusivamente em caso de falecimento, ou conforme a expansão natural do cemitério.
         </p>
        <p><b>1º §</b>Parágrafo único. Na hipótese de o cessionário não fazer a opção da quadra referida no caput desta cláusula dentro do prazo de 30 dias, a concedente designará livremente o jazigo ao cessionário, na quadra em que houver disponibilidade </p>
       
        <p>A concedente concede ao(à) Cessionário(a) o uso do jazigo do tipo, nº <b>${assignee.valts.identificator}</b>, localizado na quadra <b>${assignee.squares.identificator} </b>, com X gavetas sem área de serviço, por prazo determinado de ${assignee.dueDate} .</p>
    </div>

    <div class="clause">
        <h2>Cláusula Segunda - Do Uso</h2>
        <p>O jazigo objeto da presente promessa de concessão destina-se exclusivamente ao sepultamento do(a) cessionário(a), de seus familiares, sucessores ou beneficiários, assim como ao sepultamento daqueles, cujo enterramento seja autorizado pelo cessionário em caráter especial.
        <p><b>1º §</b>  A concessão de que trata esta cláusula não poderá ser realizada por terceiros que desempenham quaisquer atividades ligadas, de alguma forma a Cemitérios e a Funerárias, como, por exemplo, de mera administração ou de comercialização de concessões de jazigos e semelhantes, tais como convênios ou assistências funerárias.</p>
        <p><b>2º §</b>- A concessão que se der, com infração ao <b>§</b> primeiro desta cláusula, quer por falta de informações por parte do Cessionário ou por motivo de má fé, acarretará, a qualquer tempo, na extinção da presente concessão, independentemente de qualquer aviso ou interpelação judicial ou extrajudicial.</p>
        <p><b>3º §</b>. Qualquer sepultamento estará sujeito à quitação do preço de que trata a cláusula quinta.</p>
        <p><b>4º §</b>. Sem a prévia quitação do preço, só serão autorizados sepultamentos mediante garantia real ou pessoal de pagamento do saldo devido, a critério da concedente.</p>
        <p><b>5º §</b>. Havendo necessidade de sepultamento no prazo de até 90 (Noventa) dias contados a partir do pagamento da primeira parcela (boleto bancário), além da garantia do <b>§</b> segundo, será exigido pagamento suplementar de 20% sobre o valor total do jazigo a vista de acordo com a tabela vigente oficial e não promocional. Há isenção da carência nos casos de morte acidental.</p></p>
    </div>

    <div class="clause">
        <h2>Cláusula Terceira - Da Concessão</h2>
        <p>A concessão a ser feita ao(à) Cessionário(a) mediante a quitação do preço ajustado na cláusula quarta, terá caráter perpétuo, estando sujeita à condição de o(a) Cessionário(a), seus sucessores ou beneficiários cumprirem suas obrigações, em especial no que diz respeito ao pagamento das taxas de administração e conservação em acordo com a cláusula quinta, parágrafo primeiro.</p>
    </div>

    <div class="clause">
        <h2>Cláusula Quarta - Do Preço</h2>
        <p>O(a) Cessionário(a) obriga-se a pagar o preço de ${assignee.saleValue}, ${assignee.formPay}, pago em ${assignee.paymentDate} </p>

        <p><b>1º §</b> A cobrança das parcelas vincendas será feita por via de boletos bancários, a serem remetidos ao endereço do(a) Cessionário(a), que deverá efetuar o respectivo pagamento diretamente ao banco autorizado. </p>

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
            <p>${graveyard.nameEnterprise}.</p>
        </div>
        <div>
            <p><b>Cessionário</b></p>
            <p>___________________________________</p>
            <p>${assignee.name}</p>
        </div>
    </div>

    <p><strong>Data:</strong> ${assignee.contractDate}</p>
</body>
</html>
`;
